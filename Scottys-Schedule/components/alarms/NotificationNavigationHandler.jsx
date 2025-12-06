import React, { useCallback, useEffect, useRef } from "react";
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

  const pendingNotificationRef = useRef(null);
  const lastHandledAlarmRef = useRef(null);
  const navigationLockRef = useRef(false);
  const handledNotificationIdsRef = useRef(new Set());

  const resolveAlarmFromNotification = useCallback(
    async (alarmId, notificationId) => {
      if (alarmId) {
        const byId = alarms.find((alarm) => alarm.id === alarmId);
        if (byId?.enabled) {
          if (notificationId) {
            try {
              await Notifications.dismissNotificationAsync(notificationId);
            } catch (error) {
              console.log("[NotificationHandler] Failed to dismiss notification", error);
              handledNotificationIdsRef.current.add(notificationId);
            }
          }
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
    async ({ alarmId: rawAlarmId, notificationId }) => {
      if (notificationId && handledNotificationIdsRef.current.has(notificationId)) {
        console.log("[NotificationHandler] Notification already handled, skipping", notificationId);
        return;
      }

      const alarm = await resolveAlarmFromNotification(rawAlarmId, notificationId);

      if (!alarm) {
        console.log("[NotificationHandler] No matching alarm for notification", rawAlarmId);
        pendingNotificationRef.current = {
          alarmId: rawAlarmId,
          notificationId,
          deliveredAt: Date.now(),
        };
        return;
      }

      if (activeRingingAlarmId === alarm.id) {
        return;
      }

      if (navigationLockRef.current) {
        console.log("[NotificationHandler] Navigation already in progress, skipping", alarm.id);
        return;
      }

      if (alarm?.nextTriggerMs && Date.now() + 15 * 1000 < alarm.nextTriggerMs) {
        console.log(
          "[NotificationHandler] Ignoring premature trigger for",
          alarm.id,
          "expected at",
          new Date(alarm.nextTriggerMs).toISOString()
        );
        return;
      }

      const lastHandled = lastHandledAlarmRef.current;
      if (
        lastHandled &&
        lastHandled.alarmId === alarm.id &&
        Date.now() - lastHandled.handledAt <= RECENT_WINDOW_MS
      ) {
        console.log(
          "[NotificationHandler] Alarm already handled recently, skipping",
          alarm.id
        );
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
      lastHandledAlarmRef.current = {
        alarmId: alarm.id,
        handledAt: Date.now(),
      };
      navigationLockRef.current = true;
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
          handleAlarmNotification({
            alarmId,
            notificationId: notification.request.identifier,
          });
        }
      }
    );

    const responseSub =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const alarmId = response.notification.request.content.data?.alarmId;
        handleAlarmNotification({
          alarmId,
          notificationId: response.notification.request.identifier,
        });
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
        handleAlarmNotification({
          alarmId,
          notificationId: response.notification.request.identifier,
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [handleAlarmNotification]);

  useEffect(() => {
    const pending = pendingNotificationRef.current;
    if (!pending) {
      return;
    }

    if (!alarms || alarms.length === 0) {
      return;
    }

    const isRecent = Date.now() - pending.deliveredAt <= RECENT_WINDOW_MS;
    if (!isRecent) {
      pendingNotificationRef.current = null;
      return;
    }

    handleAlarmNotification({
      alarmId: pending.alarmId,
      notificationId: pending.notificationId,
    });
    pendingNotificationRef.current = null;
  }, [alarms, handleAlarmNotification]);

  useEffect(() => {
    if (!activeRingingAlarmId) {
      navigationLockRef.current = false;
      lastHandledAlarmRef.current = null;
      handledNotificationIdsRef.current.clear();
    }
  }, [activeRingingAlarmId]);

  return null;
}
