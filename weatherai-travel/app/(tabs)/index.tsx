import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { getRecentCities, saveRecentCity } from '../../services/storage';
import { geocodeCity } from '../../services/api';

export default function HomeScreen() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentCities, setRecentCities] = useState<string[]>([]);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const cities = await getRecentCities();
    setRecentCities(cities);
  };

  const performSearch = async (searchCity: string) => {
    const cityToSearch = searchCity.trim();
    if (!cityToSearch) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    setLoading(true);
    try {
      await geocodeCity(cityToSearch);
      await saveRecentCity(cityToSearch);
      setCity(''); // clear input after successful search
      router.push(`/weather/${encodeURIComponent(cityToSearch)}`);
    } catch (err: any) {
      const isNetworkError = err.message?.includes('Network') || err.message?.includes('fetch');
      const errorMsg = isNetworkError
        ? 'No internet connection. Please try again.'
        : 'City not found. Check spelling or try a different city.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      performSearch(city);
    }, 500);
  }, [city]);

  const handleRecentPress = (cityName: string) => {
    setCity(cityName);
    performSearch(cityName);
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Allow location to use this feature.');
      return;
    }
    setLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      // Pass coordinates directly to weather screen
      router.push(`/weather/${location.coords.latitude},${location.coords.longitude}`);
    } catch (err) {
      Alert.alert('Error', 'Could not get your location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <Text className="text-3xl font-bold text-center my-8">🌤️ WeatherAI Travel</Text>
      
      <TextInput
        className="bg-white rounded-xl p-4 text-base mb-4"
        placeholder="Enter city name (e.g., Tokyo)"
        value={city}
        onChangeText={setCity}
        onSubmitEditing={handleSearch}
      />
      
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-xl items-center"
        onPress={handleSearch}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-lg font-semibold">Get Weather</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-green-500 p-4 rounded-xl items-center mt-3"
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Text className="text-white text-lg font-semibold">📍 Use my location</Text>
      </TouchableOpacity>

      {recentCities.length > 0 && (
        <>
          <Text className="text-base font-semibold mt-8 mb-2">Recent searches</Text>
          <FlatList
            horizontal
            data={recentCities}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-gray-200 px-4 py-2 rounded-full mr-2"
                onPress={() => handleRecentPress(item)}
              >
                <Text className="text-gray-800">{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item, idx) => `${item}-${idx}`}
            showsHorizontalScrollIndicator={false}
          />
        </>
      )}
    </View>
  );
}