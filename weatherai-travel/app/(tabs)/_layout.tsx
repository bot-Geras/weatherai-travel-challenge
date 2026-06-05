import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
   <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;
          if (route.name === 'index') iconName = focused ? 'search' : 'search-outline';
          else iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Search', headerShown: true }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', headerShown: true }} />
    </Tabs>
  );
}