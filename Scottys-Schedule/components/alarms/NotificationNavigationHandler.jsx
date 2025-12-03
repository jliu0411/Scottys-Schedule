import React, { useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useAlarms } from "./alarmContext";

export default function NotificationNavigationHandler() {
  const router = useRouter();
  const { alarms, activeRingingAlarmId, markAlarmAsRinging } = useAlarms();

  const handleAlarmNotification = useCallback(
    (alarmId) => {
      if (alarmId == null) return;

      const alarm = alarms.find((a) => a.id === alarmId);
      if (!alarm || !alarm.enabled) return;

      if (activeRingingAlarmId === alarmId) return;

      markAlarmAsRinging(alarmId);
      router.push({
        pathname: "/alarmRinging",
        params: { id: String(alarmId) },
      });
    },
    [alarms, activeRingingAlarmId, markAlarmAsRinging, router]
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
