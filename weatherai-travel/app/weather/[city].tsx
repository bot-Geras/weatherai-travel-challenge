import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ScrollView, RefreshControl, Text, View, TouchableOpacity,  } from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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

  if (travelLoading && !weatherData) return <LoadingSpinner message={`Analyzing ${decodedCity}...`} />;
  
  if (travelError && !weatherData) return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-10">
      <Ionicons name="cloud-offline-outline" size={80} color="#EF4444" />
      <Text className="text-xl font-bold text-gray-900 mt-6 text-center">Connection Lost</Text>
      <Text className="text-gray-500 text-center mt-2">We couldn't reach the weather station. Please check your internet.</Text>
      <TouchableOpacity 
        className="bg-blue-600 px-8 py-4 rounded-2xl mt-8"
        onPress={() => refetch()}
      >
        <Text className="text-white font-bold">Try Again</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
  
  if (!weatherData) return null;

  const { weather, advice, source, cache_info } = weatherData;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-gray-100 p-2 rounded-full"
        >
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1 text-center mr-8">
          {decodedCity}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={travelLoading} 
            onRefresh={() => refetch()} 
            tintColor="#3B82F6"
          />
        }
      >
        <Animated.View entering={FadeIn.duration(500)}>
          <WeatherCard weather={weather} units={units} />
          <AISummaryCard advice={advice} source={source} />
          
          {dailyForecast.length > 0 && !forecastLoading && (
            <Animated.View entering={FadeInDown.delay(500).duration(800)}>
              <ForecastRow daily={dailyForecast} units={units} />
            </Animated.View>
          )}

          <View className="p-10 items-center opacity-40">
            <View className="flex-row items-center mb-1">
              <Ionicons name="information-circle-outline" size={12} color="#9CA3AF" />
              <Text className="text-gray-500 text-[10px] ml-1 uppercase tracking-tighter">
                Data Source: {source === 'api' ? 'Live AI' : 'Cached'} • {cache_info?.weather_current === 'cache' ? 'Cached' : 'Live'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}