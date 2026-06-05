import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface AISummaryCardProps {
  advice: string;
  source: 'api' | 'cache' | 'fallback';
}

export default function AISummaryCard({ advice, source }: AISummaryCardProps) {
  let badge = '';
  let badgeColor = 'text-blue-400';
  if (source === 'api') {
    badge = '✨ AI Generated';
    badgeColor = 'text-purple-500';
  } else if (source === 'cache') {
    badge = '📦 Cached';
    badgeColor = 'text-gray-400';
  } else {
    badge = '📝 Fallback';
    badgeColor = 'text-orange-400';
  }

  return (
    <Animated.View 
      entering={FadeInUp.delay(300).duration(800)}
      className="bg-slate-50 rounded-3xl p-6 mx-5 my-2 border border-slate-100 shadow-sm"
    >
      <View className="flex-row items-center mb-4">
        <View className="bg-purple-100 p-2 rounded-xl mr-3">
          <Ionicons name="sparkles" size={20} color="#A855F7" />
        </View>
        <Text className="text-xl font-bold text-slate-800">Travel Assistant</Text>
      </View>
      
      <Text className="text-base text-slate-600 leading-6 mb-4">
        {advice}
      </Text>
      
      <View className="flex-row justify-end items-center">
        <Text className={`text-xs font-bold uppercase tracking-widest ${badgeColor}`}>
          {badge}
        </Text>
      </View>
    </Animated.View>
  );
}