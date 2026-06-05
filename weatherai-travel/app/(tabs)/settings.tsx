import { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { getUnits, saveUnits, clearWeatherCache } from '../../services/storage';

export default function SettingsScreen() {
  const [isMetric, setIsMetric] = useState(true);

  useEffect(() => {
    loadUnits();
  }, []);

  const loadUnits = async () => {
    const units = await getUnits();
    setIsMetric(units === 'metric');
  };

  const toggleUnits = async (value: boolean) => {
    setIsMetric(value);
    await saveUnits(value ? 'metric' : 'imperial');
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear cache',
      'Remove all saved weather data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearWeatherCache();
            Alert.alert('Done', 'Cache cleared');
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-100 p-5">
      <View className="bg-white rounded-xl p-4 mb-5 flex-row justify-between items-center">
        <Text className="text-base">Temperature units</Text>
        <View className="flex-row items-center">
          <Text>°C</Text>
          <Switch value={isMetric} onValueChange={toggleUnits} className="mx-2" />
          <Text>°F</Text>
        </View>
      </View>
      <TouchableOpacity className="bg-red-500 p-4 rounded-xl items-center mb-8" onPress={handleClearCache}>
        <Text className="text-white font-semibold text-base">Clear weather cache</Text>
      </TouchableOpacity>
      <View className="items-center mt-10">
        <Text className="text-lg font-bold">WeatherAI Travel Assistant</Text>
        <Text className="text-gray-500">v1.0.0</Text>
        <Text className="text-gray-400 text-xs text-center mt-2">
          Powered by WeatherAI API + Gemini/DeepSeek
        </Text>
      </View>
    </View>
  );
}