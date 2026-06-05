import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    setLoading(true);
    try {
      await geocodeCity(cityToSearch);
      await saveRecentCity(cityToSearch);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setCity(''); // clear input after successful search
      router.push(`/weather/${encodeURIComponent(cityToSearch)}`);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCity(cityName);
    performSearch(cityName);
  };

  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Permission denied', 'Allow location to use this feature.');
      return;
    }
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const location = await Location.getCurrentPositionAsync({});
      router.push(`/weather/${location.coords.latitude},${location.coords.longitude}`);
    } catch (err) {
      Alert.alert('Error', 'Could not get your location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20">
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <Text className="text-4xl font-extrabold text-gray-900 mb-2">WeatherAI</Text>
          <Text className="text-xl text-gray-500 mb-10">Your smart travel companion</Text>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.delay(200).duration(1000).springify()}
          className="bg-gray-100 rounded-2xl flex-row items-center px-4 py-1 mb-4 shadow-sm border border-gray-200"
        >
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 p-3 text-base text-gray-900"
            placeholder="Where are you going?"
            placeholderTextColor="#9CA3AF"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={handleSearch}
          />
        </Animated.View>
        
        <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
          <TouchableOpacity
            className="bg-blue-600 p-4 rounded-2xl items-center shadow-md active:opacity-90"
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">Search Weather</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row justify-center items-center p-4 mt-3"
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Ionicons name="location" size={18} color="#3B82F6" />
            <Text className="text-blue-500 text-base font-semibold ml-2">Use my location</Text>
          </TouchableOpacity>
        </Animated.View>

        {recentCities.length > 0 && (
          <Animated.View 
            entering={FadeInUp.delay(600).duration(1000).springify()}
            className="mt-10"
          >
            <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Destinations</Text>
            <FlatList
              horizontal
              data={recentCities}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="bg-gray-100 px-5 py-3 rounded-2xl mr-3 border border-gray-200 shadow-sm"
                  onPress={() => handleRecentPress(item)}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="#6B7280" className="mr-2" />
                    <Text className="text-gray-700 font-medium ml-2">{item}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item, idx) => `${item}-${idx}`}
              showsHorizontalScrollIndicator={false}
            />
          </Animated.View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}