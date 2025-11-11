import { Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {useEffect} from 'react';
import "@/assets/font/Jersey10-Regular.ttf"
import * as Notifications from "expo-notifications"
import 'expo-router/entry'
import { AlarmProvider } from "../components/alarms/alarmLocalStorage";
import { BooksProvider } from '../contexts/BooksContext';
import { Colors } from "../constants/Colors"
import { useColorScheme } from "react-native"
import { StatusBar } from "expo-status-bar"
import { UserProvider } from "../contexts/UserContext"

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});



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
        <AlarmProvider>
          <StatusBar value="auto" />
          <Stack screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTitleStyle: { fontFamily: 'Jersey10', fontSize: 48 },
            headerTitleAlign: 'center',
            headerTintColor: theme.title,
          }}>
            <Stack.Screen name="index" options={{ title: "Welcome!" }} />
            <Stack.Screen name="alarms" options={{ title: "Alarms" }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
            <Stack.Screen name="newAlarm" options={{ title: 'New Alarm' }} />
            <Stack.Screen name="newTask" options={{ title: 'New Task' }} />
            <Stack.Screen name="editTask" options={{ title: 'Edit Task' }} />
            <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
          </Stack>
        </AlarmProvider>
      </BooksProvider>
    </UserProvider>
  )
}