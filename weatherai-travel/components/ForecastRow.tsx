// components/ForecastRow.tsx
import React from 'react';
import { View, Text, FlatList, Image } from 'react-native';

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

// Map condition code to a simple emoji/icon (optional)
const getConditionEmoji = (code: string): string => {
  const map: Record<string, string> = {
    '0': '☀️', '1': '🌤️', '2': '⛅', '3': '☁️',
    '51': '🌦️', '53': '🌧️', '55': '🌧️',
    '61': '🌧️', '63': '🌧️', '65': '⛈️'
  };
  return map[code] || '🌡️';
};

export default function ForecastRow({ daily, units }: ForecastRowProps) {
  const symbol = units === 'metric' ? '°C' : '°F';

  return (
    <View className="mt-4 mx-5">
      <Text className="text-lg font-bold mb-2">📅 5‑Day Forecast</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={daily.slice(0, 5)}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View className="bg-white rounded-xl p-3 mr-3 items-center w-24 shadow-sm">
            <Text className="text-sm font-semibold">{item.date}</Text>
            <Text className="text-2xl">{getConditionEmoji(item.condition_code)}</Text>
            <Text className="text-blue-500 font-bold">
              {Math.round(item.temp_max)}{symbol}
            </Text>
            <Text className="text-gray-500 text-xs">
              {Math.round(item.temp_min)}{symbol}
            </Text>
          </View>
        )}
      />
    </View>
  );
}