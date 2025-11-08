import { Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import "@/assets/font/Jersey10-Regular.ttf"
import { BooksProvider } from '../contexts/BooksContext';
import { Colors } from "../constants/Colors"
import { useColorScheme } from "react-native"
import { StatusBar } from "expo-status-bar"
import { UserProvider } from "../contexts/UserContext"

SplashScreen.preventAutoHideAsync();


export default function RootLayout() {
  const colorScheme = useColorScheme()
  const theme = Colors[colorScheme] ?? Colors.light
  //Custom Font
  const [loaded, error] = useFonts({
    'Jersey10': require('@/assets/font/Jersey10-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <UserProvider>
      <BooksProvider>
        <StatusBar value="auto" />
        <Stack screenOptions={{
          headerStyle: { backgroundColor: theme.navBackground },
          headerTintColor: theme.title,
        }}>
          <Stack.Screen name="index" options={{ title: "Home" }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
        </Stack>
      </BooksProvider>
    </UserProvider>
  )
}