import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loadAlarmsFromAppwrite,
  createAlarmInAppwrite,
  updateAlarmInAppwrite,
  deleteAlarmInAppwrite,
} from "./alarmContextHelper/alarmService";

import {
  setupNotifications,
  scheduleNotificationsForAlarm,
  cancelNotificationsForAlarm,
} from "./alarmContextHelper/alarmNotifications";

import { useUser } from "../../hooks/useUser";


const alarmContext = createContext();

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([]);
  const [activeRingingAlarmId, setActiveRingingAlarmId] = useState(null);

  const { user } = useUser();

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setAlarms([]);
        return;
      }
      const loadedAlarms = await loadAlarmsFromAppwrite(user.$id);
      setAlarms(loadedAlarms);
  };
    load();
  }, [user]);

  useEffect(() => {
    setupNotifications();
  }, []);

  const addAlarm = async ({ timer, repeatDays, puzzle, enabled }) => {
    try {
      if (!user) {
        console.warn("addAlarm called with no logged-in user");
        return;
      }

      const baseAlarm = await createAlarmInAppwrite({
        timer,
        repeatDays,
        puzzle,
        enabled,
        userId: user.$id, 
      });
      //user.$id
      let notificationIds = [];
      if (baseAlarm.enabled) {
        notificationIds = await scheduleNotificationsForAlarm(baseAlarm);
      }

      const alarmWithNotifications = {
        ...baseAlarm,
        notificationIds,
      };

      setAlarms((prev) => [...prev, alarmWithNotifications]);
    } catch (e) {
      console.log("Error creating alarm in Appwrite:", e);
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

      await updateAlarmInAppwrite(id, updatedAlarm);

      setAlarms((prev) =>
        prev.map((a) => (a.id === id ? updatedAlarm : a))
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

      await deleteAlarmInAppwrite(id);

      setAlarms((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      console.log("Error deleting alarm:", e);
    }
  };

  const toggleAlarm = async (id, nextEnabled) => {
    await updateAlarm(id, { enabled: nextEnabled });
  };

  const cancelFutureNotificationsForAlarm = async (id) => {
    const alarm = alarms.find((a) => a.id === id);
    if (!alarm) return;

    await cancelNotificationsForAlarm(alarm);

    const cleared = { ...alarm, notificationIds: [] };

    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? cleared : a))
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
    <alarmContext.Provider
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
    </alarmContext.Provider>
  );
};

export const useAlarms = () => useContext(alarmContext);
