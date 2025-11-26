import { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const alarmLocalStorage = createContext();
const STORAGE_KEY = "alarms";

const NAG_INTERVAL_MS = 3000;
const NAG_COUNT = 20;   

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);


  useEffect(() => {
    const loadAlarms = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setAlarms(JSON.parse(stored));
        }
      } catch (e) {
        console.log("Error loading alarms:", e);
      }
    };

    loadAlarms();
  }, []);

  useEffect(() => {
    const setupNotifications = async () => {
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

    setupNotifications();
  }, []);

  const saveAlarms = async (next) => {
    setAlarms((prev) => {
      const updated = typeof next === "function" ? next(prev) : next;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch((e) =>
        console.log("Error saving alarms:", e)
      );
      return updated;
    });
  };

  const scheduleNotificationsForAlarm = async (alarm) => {
    const storedTime = new Date(alarm.time);
    const hour = storedTime.getHours();
    const minute = storedTime.getMinutes();

    const ids = [];

    const baseContent = {
      title: "Alarm",
      body: "Time to do your task!",
      sound: "default",
      data: { alarmId: alarm.id },
    };

    const now = new Date();
    let firstTrigger = new Date();

    firstTrigger.setHours(hour);
    firstTrigger.setMinutes(minute);
    firstTrigger.setSeconds(0);
    firstTrigger.setMilliseconds(0);

    if (firstTrigger <= now) {
      firstTrigger.setDate(firstTrigger.getDate() + 1);
    }

    for (let i = 0; i < NAG_COUNT; i++) {
      const triggerDate = new Date(
        firstTrigger.getTime() + i * NAG_INTERVAL_MS
      );

      const id = await Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger: {
          date: triggerDate,  
          channelId: "alarm",  
        },
      });

      ids.push(id);
    }

    return ids;
  };

  const cancelNotificationsForAlarm = async (alarm) => {
    if (!alarm?.notificationIds) return;
    try {
      for (const id of alarm.notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (e) {
      console.log("Error cancelling notifications:", e);
    }
  };

  const cancelFutureNotificationsForAlarm = async (id) => {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;

    await cancelNotificationsForAlarm(alarm);

    await saveAlarms((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, notificationIds: [] } : a
      )
    );
  };

  const addAlarm = async (alarm) => {
    try {
      const enabled = alarm.enabled ?? true;

      let notificationIds = [];
      if (enabled) {
        notificationIds = await scheduleNotificationsForAlarm(alarm);
      }

      const alarmWithNotifications = {
        ...alarm,
        enabled,
        notificationIds,
      };

      await saveAlarms((prev) => [...prev, alarmWithNotifications]);
    } catch (e) {
      console.log("Error saving alarm:", e);
    }
  };

  const updateAlarm = async (id, updates) => {
    try {
      const existing = alarms.find((a) => a.id === id);
      if (!existing) return;

      await cancelNotificationsForAlarm(existing);

      const updatedAlarm = { ...existing, ...updates };

      let notificationIds = [];
      if (updatedAlarm.enabled) {
        notificationIds = await scheduleNotificationsForAlarm(updatedAlarm);
      }
      updatedAlarm.notificationIds = notificationIds;

      await saveAlarms((prev) =>
        prev.map((alarm) => (alarm.id === id ? updatedAlarm : alarm))
      );
    } catch (e) {
      console.log("Error updating alarm:", e);
    }
  };

  const deleteAlarm = async (id) => {
    try {
      const existing = alarms.find((a) => a.id === id);
      if (existing) {
        await cancelNotificationsForAlarm(existing);
      }

      await saveAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
    } catch (e) {
      console.log("Error deleting alarm:", e);
    }
  };

  const toggleAlarm = async (id) => {
    const existing = alarms.find((a) => a.id === id);
    if (!existing) return;

    await updateAlarm(id, { enabled: !existing.enabled });
  };

  return (
    <alarmLocalStorage.Provider
      value={{
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
        cancelFutureNotificationsForAlarm,
      }}
    >
      {children}
    </alarmLocalStorage.Provider>
  );
};

export const useAlarms = () => useContext(alarmLocalStorage);
