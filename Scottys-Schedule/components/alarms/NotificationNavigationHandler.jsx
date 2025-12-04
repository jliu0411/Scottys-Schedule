import React, { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAlarms } from "./alarmContext";

const RECENT_WINDOW_MS = 2 * 60 * 1000;
const FALLBACK_WINDOW_MINUTES = 2;

export default function NotificationNavigationHandler() {
  const router = useRouter();
  const {
    alarms,
    activeRingingAlarmId,
    markAlarmAsRinging,
    updateAlarm,
  } = useAlarms();

  const resolveAlarmFromNotification = useCallback(
    (alarmId) => {
      if (alarmId) {
        const byId = alarms.find((alarm) => alarm.id === alarmId);
        if (byId?.enabled) {
          return byId;
        }
      }

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      return alarms.find((alarm) => {
        if (!alarm.enabled) {
          return false;
        }

        const alarmTime = new Date(alarm.time);
        const alarmMinutes = alarmTime.getHours() * 60 + alarmTime.getMinutes();
        return Math.abs(alarmMinutes - nowMinutes) <= FALLBACK_WINDOW_MINUTES;
      });
    },
    [alarms]
  );

  const handleAlarmNotification = useCallback(
    async (rawAlarmId) => {
      const alarm = resolveAlarmFromNotification(rawAlarmId);

      if (!alarm) {
        console.log("[NotificationHandler] No matching alarm for notification", rawAlarmId);
        return;
      }

      if (activeRingingAlarmId === alarm.id) {
        return;
      }

      if (Array.isArray(alarm.repeatDays) && alarm.repeatDays.length > 0) {
        try {
          await updateAlarm(alarm.id, {});
        } catch (error) {
          console.log("[NotificationHandler] Failed to reschedule repeating alarm", error);
        }
      }

      markAlarmAsRinging(alarm.id);
      router.push({
        pathname: "/alarmRinging",
        params: { id: String(alarm.id) },
      });
    },
    [
      activeRingingAlarmId,
      markAlarmAsRinging,
      resolveAlarmFromNotification,
      router,
      updateAlarm,
    ]
  );

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener(
      (notification) => {
        const alarmId = notification.request.content.data?.alarmId;
        const deliveredAt = notification.date?.getTime?.() ?? Date.now();
        const isRecent = Date.now() - deliveredAt <= RECENT_WINDOW_MS;

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
    let isMounted = true;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response) {
        return;
      }

      const alarmId = response.notification.request.content.data?.alarmId;
      const deliveredAt =
        response.notification.date?.getTime?.() ??
        response.notification.date ??
        Date.now();

      const isRecent = Date.now() - deliveredAt <= RECENT_WINDOW_MS;

      if (isRecent) {
        handleAlarmNotification(alarmId);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [handleAlarmNotification]);

  return null;
}
