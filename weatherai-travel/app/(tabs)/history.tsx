import { useState, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, TextInput} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRecentCities } from '../../services/storage';
import { HistoryItem } from '../../types';

interface HistorySection {
  title: string;
  data: HistoryItem[];
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    const data = await getRecentCities();
    setHistory(data);
  };

  const groupHistory = (items: HistoryItem[]): HistorySection[] => {
    const filtered = items.filter(item => 
      item && item.city && typeof item.city === 'string' &&
      item.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const today: HistoryItem[] = [];
    const yesterday: HistoryItem[] = [];
    const earlier: HistoryItem[] = [];

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayDate = todayDate - 86400000;

    filtered.forEach(item => {
      if (item.timestamp >= todayDate) {
        today.push(item);
      } else if (item.timestamp >= yesterdayDate) {
        yesterday.push(item);
      } else {
        earlier.push(item);
      }
    });

    const sections: HistorySection[] = [];
    if (today.length > 0) sections.push({ title: 'Today', data: today });
    if (yesterday.length > 0) sections.push({ title: 'Yesterday', data: yesterday });
    if (earlier.length > 0) sections.push({ title: 'Earlier', data: earlier });

    return sections;
  };

  const handleItemPress = (city: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/weather/${encodeURIComponent(city)}`);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-4 flex-1">
        <Text className="text-3xl font-extrabold text-gray-900 mb-6">Search History</Text>

        <View className="bg-gray-100 rounded-2xl flex-row items-center px-4 py-1 mb-6 border border-gray-200">
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 p-3 text-base text-gray-900"
            placeholder="Search your history..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <SectionList
          sections={groupHistory(history)}
          keyExtractor={(item, index) => (item?.city || 'unknown') + (item?.timestamp || index)}
          renderItem={({ item }) => {
            if (!item || !item.city) return null;
            return (
              <TouchableOpacity
                onPress={() => handleItemPress(item.city)}
                className="flex-row items-center py-4 border-b border-gray-50 active:bg-gray-50"
              >
                <View className="bg-blue-50 p-2 rounded-xl mr-4">
                  <Ionicons name="location-outline" size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">{item.city}</Text>
                  <Text className="text-xs text-gray-400 mt-0.5">
                    {formatTime(item.timestamp)} • {formatDate(item.timestamp)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            );
          }}
          renderSectionHeader={({ section: { title } }) => (
            <View className="bg-white py-2">
              <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center pt-20">
              <Ionicons name="time-outline" size={60} color="#F3F4F6" />
              <Text className="text-gray-400 mt-4 font-medium">No history found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}