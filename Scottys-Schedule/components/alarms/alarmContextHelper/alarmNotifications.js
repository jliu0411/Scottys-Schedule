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
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        enableLights: true,
        enableVibrate: true,
        bypassDnd: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
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

  const buildContent = (extraData = {}) => ({
    title: "Alarm",
    body: "Time to do your task!",
    sound: true,
    data: {
      alarmId: String(alarm.id),
      ...extraData,
    },
  });

  const ids = [];

  const scheduleDateNotification = async (date, extraData = {}) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return;
    }

    const trigger = {
      channelId: "alarm",
      type: "date",
      date,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: buildContent(extraData),
      trigger,
    });

    ids.push(notificationId);
  };

  await scheduleDateNotification(fireDate, { kind: "primary" });

  const nagOffsetsSeconds = [60, 180, 300, 420, 540];
  const nowMs = Date.now();

  for (const offsetSeconds of nagOffsetsSeconds) {
    const targetMs = firstMs + offsetSeconds * 1000;
    if (targetMs <= nowMs) {
      continue;
    }

    await scheduleDateNotification(new Date(targetMs), {
      kind: "nag",
      offsetSeconds,
    });
  }

  return {
    notificationIds: ids,
    nextTriggerMs: firstMs,
  };
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
