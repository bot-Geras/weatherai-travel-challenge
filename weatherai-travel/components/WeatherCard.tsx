import React from 'react';
import { View, Text } from 'react-native';
import { WeatherData } from '../types';

interface WeatherCardProps {
  weather: WeatherData;
  units: 'metric' | 'imperial';
}

export default function WeatherCard({ weather, units }: WeatherCardProps) {
  const symbol = units === 'metric' ? '°C' : '°F';
  return (
    <View className="bg-white rounded-2xl p-5 mx-5 my-2 items-center shadow-md">
      <Text className="text-5xl font-bold text-blue-500">
        {weather.temp}{symbol}
      </Text>
      <Text className="text-2xl my-1">{weather.condition}</Text>
      <Text className="text-base text-gray-500 mt-1">💧 Humidity: {weather.humidity}%</Text>
    </View>
  );
}