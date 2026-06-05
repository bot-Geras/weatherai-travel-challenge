// components/ForecastRow.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DailyForecast {
  date: string;
  temp_min: number;
  temp_max: number;
  condition_code: string;
  icon: string;
}

interface ForecastRowProps {
  daily: DailyForecast[];
  units: 'metric' | 'imperial';
}

const getConditionIcon = (code: string): any => {
  const map: Record<string, string> = {
    '0': 'sunny', '1': 'partly-sunny', '2': 'cloudy', '3': 'cloud',
    '51': 'rainy', '53': 'rainy', '55': 'rainy',
    '61': 'showers', '63': 'showers', '65': 'thunderstorm'
  };
  return map[code] || 'thermometer';
};

const getIconColor = (code: string): string => {
  const map: Record<string, string> = {
    '0': '#FBBF24', '1': '#FBBF24', '2': '#9CA3AF', '3': '#9CA3AF',
    '51': '#60A5FA', '53': '#60A5FA', '55': '#60A5FA',
    '61': '#3B82F6', '63': '#3B82F6', '65': '#818CF8'
  };
  return map[code] || '#FBBF24';
};

export default function ForecastRow({ daily, units }: ForecastRowProps) {
  const symbol = units === 'metric' ? '°' : '°'; // Using degree symbol only for compact view

  return (
    <View className="mt-6 mx-5 mb-10">
      <Text className="text-xl font-bold text-gray-800 mb-4 px-1">5‑Day Forecast</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={daily.slice(0, 5)}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View className="bg-white rounded-3xl p-4 mr-3 items-center w-28 shadow-sm border border-gray-50">
            <Text className="text-xs font-bold text-gray-400 uppercase mb-2">{item.date}</Text>
            <View className="bg-gray-50 p-3 rounded-2xl mb-3">
              <Ionicons 
                name={getConditionIcon(item.condition_code)} 
                size={32} 
                color={getIconColor(item.condition_code)} 
              />
            </View>
            <View className="flex-row items-end">
              <Text className="text-lg font-black text-gray-800">
                {Math.round(item.temp_max)}{symbol}
              </Text>
              <Text className="text-sm font-bold text-gray-300 ml-1 mb-0.5">
                {Math.round(item.temp_min)}{symbol}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}