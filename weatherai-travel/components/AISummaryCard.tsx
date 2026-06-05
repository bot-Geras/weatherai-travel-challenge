import React from 'react';
import { View, Text } from 'react-native';

interface AISummaryCardProps {
  advice: string;
  source: 'api' | 'cache' | 'fallback';
}

export default function AISummaryCard({ advice, source }: AISummaryCardProps) {
  let badge = '';
  if (source === 'api') badge = '✨ AI generated';
  else if (source === 'cache') badge = '📦 Cached';
  else badge = '📝 Fallback';

  return (
    <View className="bg-blue-50 rounded-2xl p-5 mx-5 my-2 border border-blue-200">
      <Text className="text-lg font-bold text-blue-800 mb-2">🤖 Travel Assistant</Text>
      <Text className="text-sm text-blue-900 leading-5">{advice}</Text>
      <Text className="text-xs text-blue-300 mt-2 text-right">{badge}</Text>
    </View>
  );
}