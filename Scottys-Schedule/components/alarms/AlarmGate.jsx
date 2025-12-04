import React, { useEffect } from "react";
import { AppState } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAlarms } from "./alarmContext";

export default function AlarmGate() {
  const router = useRouter();
  const { alarms, activeRingingAlarmId, markAlarmAsRinging } = useAlarms();

  useEffect(() => {
    const checkForRingingAlarm = async () => {
      try {
        const presented = await Notifications.getPresentedNotificationsAsync();

        const alarmNotification = presented.find((n) => {
          const data = n.request?.content?.data;
          return data && typeof data.alarmId === "string";
        });

        if (!alarmNotification) return;

        const alarmId = alarmNotification.request.content.data.alarmId;

        if (activeRingingAlarmId === alarmId) {
          return;
        }

        const alarmExists = alarms.some((alarm) => alarm.id === alarmId);
        if (!alarmExists) {
          return;
        }

        markAlarmAsRinging(alarmId);

        router.push({
          pathname: "/alarmRinging",
          params: { id: alarmId },
        });
      } catch (e) {
        console.log("Error checking for ringing alarm:", e);
      }
    };

    checkForRingingAlarm();

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkForRingingAlarm();
      }
    });

    return () => sub.remove();
  }, [router, alarms, activeRingingAlarmId, markAlarmAsRinging]);

  return null; 
}
