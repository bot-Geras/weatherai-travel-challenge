import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#007AFF" />
      <Text className="mt-2 text-base">{message}</Text>
    </View>
  );
}