import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, RefreshControl, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { getTravelAdvice, getForecast } from '../../services/api';
import { getLastWeather, saveLastWeather, getUnits } from '../../services/storage';
import WeatherCard from '../../components/WeatherCard';
import AISummaryCard from '../../components/AISummaryCard';
import ForecastRow from '../../components/ForecastRow';
import LoadingSpinner from '../../components/LoadingSpinner';
import { TravelAdviceResponse } from '../../types';

export default function WeatherScreen() {
  const { city } = useLocalSearchParams<{ city: string }>();
  const decodedCity = decodeURIComponent(city);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => { loadUnits(); }, []);
  const loadUnits = async () => {
    const saved = await getUnits();
    setUnits(saved);
  };

  const { data: travelData, isLoading: travelLoading, isError: travelError, refetch } = useQuery<TravelAdviceResponse>({
    queryKey: ['travelAdvice', decodedCity],
    queryFn: () => getTravelAdvice(decodedCity),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const lat = travelData?.location.lat;
  const lon = travelData?.location.lon;

  const { data: forecastResponse, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', lat, lon],
    queryFn: () => getForecast(lat!, lon!),
    enabled: !!lat && !!lon,
    staleTime: 30 * 60 * 1000,
  });

  const dailyForecast = forecastResponse?.data?.daily || [];

  useEffect(() => {
    if (travelData && !travelError) saveLastWeather(decodedCity, travelData);
  }, [travelData, travelError]);

  const [offlineData, setOfflineData] = useState<TravelAdviceResponse | null>(null);
  useEffect(() => {
    if (travelError && !travelData) getLastWeather(decodedCity).then(setOfflineData);
  }, [travelError, travelData]);

  const weatherData = travelData || offlineData;

  if (travelLoading && !weatherData) return <LoadingSpinner message={`Fetching weather for ${decodedCity}...`} />;
  if (travelError && !weatherData) return (
    <View className="flex-1 justify-center items-center p-5">
      <Text className="text-red-500 text-center">Failed to load weather. Check your connection.</Text>
    </View>
  );
  if (!weatherData) return null;

  const { weather, advice, source, cache_info } = weatherData;

  return (
    <ScrollView
      className="flex-1 bg-gray-100"
      refreshControl={<RefreshControl refreshing={travelLoading} onRefresh={() => refetch()} />}
    >
      <Text className="text-3xl font-bold text-center mt-5 mb-2">{decodedCity}</Text>
      <WeatherCard weather={weather} units={units} />
      <AISummaryCard advice={advice} source={source} />
      {dailyForecast.length > 0 && !forecastLoading && (
        <ForecastRow daily={dailyForecast} units={units} />
      )}
      <View className="p-5 items-center">
        <Text className="text-gray-500 text-xs">
          Data source: {source === 'api' ? 'Live AI' : source === 'cache' ? 'Cached' : 'Fallback'}
        </Text>
        <Text className="text-gray-500 text-xs">
          Weather: {cache_info?.weather_current === 'cache' ? 'cached' : 'live'}
        </Text>
      </View>
    </ScrollView>
  );
}