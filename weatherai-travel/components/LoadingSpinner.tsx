import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      className="flex-1 justify-center items-center bg-white px-10"
    >
      <View className="bg-blue-50 p-8 rounded-full mb-6">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
      <Text className="text-xl font-bold text-gray-900 text-center">{message}</Text>
      <Text className="text-gray-400 text-center mt-2">Connecting to AI weather stations...</Text>
    </Animated.View>
  );
}