import * as Notifications from "expo-notifications";

export function generateQuestions(count) {
  const qs = [];
  for (let i = 0; i < count; i++) {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    qs.push({ a, b });
  }
  return qs;
}

export async function scheduleNagNotification(alarmId) {
  if (!alarmId) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Alarm still ringing!",
      body: "Solve the puzzle or turn off the alarm.",
      sound: "default",
      data: { alarmId },
    },
    trigger: {
      seconds: 60, 
      repeats: true,
      channelId: "alarm",
    },
  });

  return id;
}

export async function cancelNagNotification(nagNotificationId) {
  if (!nagNotificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(nagNotificationId);
  } catch (e) {
    console.log("Error cancelling nag notification:", e);
  }
}

export async function clearAlarmNotificationsFromTray(alarmIdToClear) {
  if (!alarmIdToClear) return;
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();

    const forThisAlarm = presented.filter(
      (n) => n.request?.content?.data?.alarmId === alarmIdToClear
    );

    await Promise.all(
      forThisAlarm.map((n) =>
        Notifications.dismissNotificationAsync(n.request.identifier)
      )
    );
  } catch (e) {
    console.log("Error dismissing alarm notifications:", e);
  }
}
