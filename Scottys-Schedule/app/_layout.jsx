import { Stack, router } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "@/assets/font/Jersey10-Regular.ttf";
import * as Notifications from "expo-notifications";
import "expo-router/entry";
import { AlarmProvider } from "../components/alarms/alarmContext";
import { BooksProvider } from "../contexts/BooksContext";
import { Colors } from "../constants/Colors";
import { useColorScheme, TouchableOpacity, Image, LogBox } from "react-native";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "../contexts/UserContext";
import LandingHeader from "../components/landing/landingHeader";
import AlarmGate from "../components/alarms/AlarmGate";
import NotificationNavigationHandler from "../components/alarms/NotificationNavigationHandler";

import "@/assets/font/Jersey10-Regular.ttf";
import "expo-router/entry";

if (!console._scottysRealtimePatched) {
  const suppressedRealtimeMessages = [
    "Realtime got disconnected",
    "INVALID_STATE_ERR",
  ];

  LogBox.ignoreLogs(suppressedRealtimeMessages);

  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  const shouldSuppressLog = (entry) => {
    if (!entry) {
      return false;
    }

    if (typeof entry === "string") {
      return suppressedRealtimeMessages.some((msg) => entry.includes(msg));
    }

    const message = entry?.message ?? entry?.toString?.();
    return (
      typeof message === "string" &&
      suppressedRealtimeMessages.some((msg) => message.includes(msg))
    );
  };

  console.error = (...args) => {
    if (args.some(shouldSuppressLog)) {
      return;
    }

    originalConsoleError(...args);
  };

  console.warn = (...args) => {
    if (args.some(shouldSuppressLog)) {
      return;
    }

    originalConsoleWarn(...args);
  };

  console._scottysRealtimePatched = true;
}

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme] ?? Colors.light;

  const [loaded, error] = useFonts({
    Jersey10: require("@/assets/font/Jersey10-Regular.ttf"),
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
          <AlarmGate />

          <StatusBar value="auto" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.navBackground },
              headerTitleStyle: { fontFamily: "Jersey10", fontSize: 48 },
              headerTitleAlign: "center",
              headerTintColor: theme.title,
            }}
          >
            <Stack.Screen name="index" options={{ title: "Home" }} />

            <Stack.Screen
              name="alarms"
              options={{
                title: "Alarms",
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.replace("/landing")}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Image
                      source={require("../assets/arrows/leftArrow.png")}
                      style={{ width: 50, height: 50 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ),
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => router.push("/newAlarm")}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Image
                      source={require("../assets/buttons/addButton.png")}
                      style={{ width: 45, height: 45 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ),
              }}
            />

            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />

            <Stack.Screen
              name="newAlarm"
              options={{
                title: "New Alarm",
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.push("/alarms")}
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

            <Stack.Screen
              name="editAlarm"
              options={{
                title: "Edit Alarm",
                headerLeft: () => (
                  <TouchableOpacity
                    onPress={() => router.push("/alarms")}
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

            <Stack.Screen name="newTask" options={{ title: "New Task" }} />
            <Stack.Screen name="editTask" options={{ title: "Edit Task" }} />
            <Stack.Screen name="tasks" options={{ title: "Tasks" }} />
          </Stack>
        </AlarmProvider>
      </BooksProvider>
    </UserProvider>
  );
}
