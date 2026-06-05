import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData;
  units: 'metric' | 'imperial';
}

export default function WeatherCard({ weather, units }: WeatherCardProps) {
  const symbol = units === 'metric' ? '°C' : '°F';
  
  const getWeatherIcon = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return 'sunny';
    if (cond.includes('cloud')) return 'cloudy';
    if (cond.includes('rain')) return 'rainy';
    if (cond.includes('snow')) return 'snow';
    if (cond.includes('thunder')) return 'thunderstorm';
    return 'partly-sunny';
  };

  const getIconColor = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) return '#FBBF24';
    if (cond.includes('cloud')) return '#9CA3AF';
    if (cond.includes('rain')) return '#60A5FA';
    if (cond.includes('thunder')) return '#818CF8';
    return '#FBBF24';
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(800)}
      className="bg-white rounded-3xl p-6 mx-5 my-4 shadow-xl border border-gray-100"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-6xl font-black text-gray-900">
            {weather.temp}{symbol}
          </Text>
          <Text className="text-xl font-medium text-gray-500 capitalize mt-1">
            {weather.condition}
          </Text>
        </View>
        <Ionicons 
          name={getWeatherIcon(weather.condition) as any} 
          size={80} 
          color={getIconColor(weather.condition)} 
        />
      </View>
      
      <View className="flex-row mt-8 pt-6 border-t border-gray-50 justify-between">
        <View className="flex-row items-center">
          <View className="bg-blue-50 p-2 rounded-lg mr-3">
            <Ionicons name="water" size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase">Humidity</Text>
            <Text className="text-base font-bold text-gray-800">{weather.humidity}%</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <View className="bg-orange-50 p-2 rounded-lg mr-3">
            <Ionicons name="thermometer" size={20} color="#F59E0B" />
          </View>
          <View>
            <Text className="text-xs text-gray-400 font-bold uppercase">Feels Like</Text>
            <Text className="text-base font-bold text-gray-800">{weather.temp}{symbol}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}