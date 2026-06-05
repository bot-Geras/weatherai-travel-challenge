import { Stack } from 'expo-router';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import "../global.css";

const queryClient = new QueryClient();

export default function RootLayout() {


  return (
  
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{headerShown: false}}>

       <Stack.Screen name="(tabs)"  />
       <Stack.Screen name="weather/[city]" options={{headerShown: true, title: "Weather Details"}} />
      </Stack>
      <StatusBar style="auto" />
      </QueryClientProvider>

  
  );
}
