import { Stack, router } from 'expo-router'
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect } from 'react';
import "@/assets/font/Jersey10-Regular.ttf"
import * as Notifications from "expo-notifications"
import 'expo-router/entry'
import { AlarmProvider, useAlarms } from "../components/alarms/alarmLocalStorage";
import { BooksProvider } from '../contexts/BooksContext';
import { Colors } from "../constants/Colors"
import { useColorScheme, TouchableOpacity, Image } from "react-native"
import { StatusBar } from "expo-status-bar"
import { UserProvider } from "../contexts/UserContext"
  
SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function NotificationNavigationHandler() {
  const { alarms, activeRingingAlarmId, markAlarmAsRinging } = useAlarms();

  const handleAlarmNotification = useCallback(
    (alarmId) => {
      if (alarmId == null) return;

      const alarm = alarms.find((a) => a.id === alarmId);

      if (!alarm || !alarm.enabled) {
        return;
      }

      if (activeRingingAlarmId === alarmId) return;

      markAlarmAsRinging(alarmId);
      router.push({
        pathname: "/alarmRinging",
        params: { id: String(alarmId) },
      });
    },
    [alarms, activeRingingAlarmId, markAlarmAsRinging]
  );


  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const alarmId = notification.request.content.data?.alarmId;
        const deliveredAt = notification.date?.getTime?.() ?? Date.now();
        const isRecent = Date.now() - deliveredAt < 2 * 60 * 1000;
        if (isRecent) {
          handleAlarmNotification(alarmId);
        }
      }
    );

    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const alarmId = response.notification.request.content.data?.alarmId;
        handleAlarmNotification(alarmId);
      });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, [handleAlarmNotification]);

  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      const alarmId = response?.notification.request.content.data?.alarmId;
      const deliveredAt =
        response?.notification.date?.getTime?.() ??
        response?.notification.date ??
        Date.now();
      const isRecent = Date.now() - deliveredAt < 2 * 60 * 1000;
      if (isRecent) {
        handleAlarmNotification(alarmId);
      }
    });
  }, [handleAlarmNotification]);

  return null;
}

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
          <NotificationNavigationHandler />
          <StatusBar value="auto" />
          <Stack screenOptions={{
            headerStyle: { backgroundColor: theme.navBackground },
            headerTitleStyle: { fontFamily: 'Jersey10', fontSize: 48 },
            headerTitleAlign: 'center',
            headerTintColor: theme.title,
          }}>
            <Stack.Screen name="index" options={{ title: "Home" }} />

            <Stack.Screen name="alarms" 
              options={{ 
                title: "Alarms", 
                headerLeft: () => (
                  <TouchableOpacity onPress={() =>router.back()} style={{paddingHorizontal: 8}}>
                    <Image 
                      source = {require("../assets/arrows/leftArrow.png")}
                      style = {{width: 50, height: 50}}
                      resizeMode = "contain"
                    />
                  </TouchableOpacity>
                ), 
                headerRight: () => (
                  <TouchableOpacity onPress={() => router.push("/newAlarm")} style={{paddingHorizontal: 8}}>
                    <Image 
                      source = {require("../assets/buttons/addButton.png")}
                      style = {{width: 45, height: 45}}
                      resizeMode = "contain"
                    />
                  </TouchableOpacity>
                ), 
              }}
            />

            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />

            <Stack.Screen name="newAlarm" 
              options={{ 
                title: "New Alarm", 
                headerLeft: () => (
                  <TouchableOpacity onPress={() =>router.back()} style={{paddingHorizontal: 8}}>
                    <Image 
                      source = {require("../assets/arrows/leftArrow.png")}
                      style = {{width: 50, height: 50}}
                      resizeMode = "contain"
                    />
                  </TouchableOpacity>
                ), 
              }}
            />

            <Stack.Screen
              name="editAlarm"
              options={{
                title: "Edit Alarm",
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.back()}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Image
                      source={require("../assets/arrows/leftArrow.png")}
                      style={{ width: 50, height: 50 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ),
              }}
            />

            <Stack.Screen name="alarmRinging" options={{ headerShown: false }} />
            
            <Stack.Screen name="newTask" options={{ title: 'New Task' }} />
            <Stack.Screen name="editTask" options={{ title: 'Edit Task' }} />
            <Stack.Screen name="tasks" options={{ title: 'Tasks' }} />
          </Stack>
        </AlarmProvider>
      </BooksProvider>
    </UserProvider>
  )
}
