import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { getNextTriggerTimeMs } from "./alarmUtils";

export const setupNotifications = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Notification permission not granted");
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("alarm", {
        name: "Alarms",
        importance: Notifications.AndroidImportance.HIGH,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  } catch (e) {
    console.log("Error setting up notifications:", e);
  }
};

export const scheduleNotificationsForAlarm = async (alarm) => {
  const storedTime = new Date(alarm.time);
  const hour = storedTime.getHours();
  const minute = storedTime.getMinutes();

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    console.log(
      "Invalid alarm time, skipping schedule",
      Math.floor(alarm.time / 1000)
    );
    return [];
  }

  const repeatDays = alarm.repeatDays ?? [];

  const firstMs = getNextTriggerTimeMs(repeatDays, hour, minute);
  if (!firstMs) {
    console.log("Could not compute next trigger time");
    return [];
  }

  const fireDate = new Date(firstMs);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Alarm",
      body: "Time to do your task!",
      sound: "default",
      data: { alarmId: alarm.id }, 
    },
    trigger: {
      channelId: "alarm",
      type: "date",
      date: fireDate,
    },
  });

  return [id];
};

export const cancelNotificationsForAlarm = async (alarm) => {
  if (!alarm?.notificationIds) return;
  try {
    for (const id of alarm.notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  } catch (e) {
    console.log("Error cancelling notifications:", e);
  }
};
