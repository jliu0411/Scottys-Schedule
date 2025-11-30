import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const alarmLocalStorage = createContext();
const STORAGE_KEY = "alarms";

const NAG_INTERVAL_MS = 30 * 1000;
const NAG_DURATION_MINUTES = 10;
const NAG_COUNT = Math.ceil(
  (NAG_DURATION_MINUTES * 60 * 1000) / NAG_INTERVAL_MS
);

const DAY_TO_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeRingingAlarmId, setActiveRingingAlarmId] = useState(null);

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

  const getNextTriggerTimeMs = (
    repeatDays,
    hour,
    minute,
    startFrom = new Date()
  ) => {
    const start = new Date(startFrom);
    const baseToday = new Date(start);
    baseToday.setHours(hour);
    baseToday.setMinutes(minute);
    baseToday.setSeconds(0);
    baseToday.setMilliseconds(0);

    const candidates = (repeatDays ?? [])
      .map((day) => DAY_TO_INDEX[day])
      .filter((idx) => idx != null);

    if (candidates.length === 0) {
      if (baseToday > start) return baseToday.getTime();
      const tomorrow = new Date(baseToday);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.getTime();
    }

    let best = null;
    for (const dayIndex of candidates) {
      const candidate = new Date(baseToday);
      const offset = (dayIndex - start.getDay() + 7) % 7;
      candidate.setDate(candidate.getDate() + offset);
      if (candidate <= start) {
        candidate.setDate(candidate.getDate() + 7);
      }
      const ms = candidate.getTime();
      if (best == null || ms < best) best = ms;
    }

    return best;
  };

  const scheduleNotificationsForAlarm = async (alarm) => {
    const storedTime = new Date(alarm.time);
    const hour = storedTime.getHours();
    const minute = storedTime.getMinutes();

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      console.log("Invalid alarm time, skipping schedule", alarm.time);
      return [];
    }

    const repeatDays = alarm.repeatDays ?? [];

    const firstMs = getNextTriggerTimeMs(repeatDays, hour, minute);
    if (!firstMs) {
      console.log("Could not compute next trigger time");
      return [];
    }

    const ids = [];
    const baseContent = {
      title: "Alarm",
      body: "Time to do your task!",
      sound: "default",
      data: { alarmId: alarm.id },
    };

    for (let i = 0; i < NAG_COUNT; i++) {
      const fireMs = firstMs + i * NAG_INTERVAL_MS;
      const fireDate = new Date(fireMs);

      const trigger =
        Platform.OS === "android"
          ? {
              type: "date",
              date: fireDate,
              channelId: "alarm", 
            }
          : {
              type: "date",
              date: fireDate,
            };

      const id = await Notifications.scheduleNotificationAsync({
        content: baseContent,
        trigger,
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

  const toggleAlarm = async (id, nextEnabled) => {
    const existing = alarms.find((a) => a.id === id);
    if (!existing) return;

    const baseAlarm = { ...existing, enabled: nextEnabled };

    await saveAlarms((prev) =>
      prev.map((a) => (a.id === id ? baseAlarm : a))
    );

    await cancelNotificationsForAlarm(existing);

    let notificationIds = [];
    if (nextEnabled) {
      notificationIds = await scheduleNotificationsForAlarm(baseAlarm);
    }

    const finalAlarm = { ...baseAlarm, notificationIds };

    await saveAlarms((prev) =>
      prev.map((a) => (a.id === id ? finalAlarm : a))
    );
  };

  const markAlarmAsRinging = useCallback((id) => {
    if (id == null) return;
    setActiveRingingAlarmId((current) => current ?? id);
  }, []);

  const clearRingingAlarm = useCallback((id) => {
    setActiveRingingAlarmId((current) =>
      id != null && current === id ? null : current
    );
  }, []);

  return (
    <alarmLocalStorage.Provider
      value={{
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
        cancelFutureNotificationsForAlarm,
        activeRingingAlarmId,
        markAlarmAsRinging,
        clearRingingAlarm,
      }}
    >
      {children}
    </alarmLocalStorage.Provider>
  );
};

export const useAlarms = () => useContext(alarmLocalStorage);
