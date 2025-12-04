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
