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
  if (!alarmId) return [];

  const scheduledIds = [];
  const now = Date.now();

  for (let i = 0; i < 200; i++) {
    const triggerTime = now + (i * 3000); // 0s, 3s, 6s...

    // We use a try-catch inside the loop so one failure doesn't stop the rest
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Alarm still ringing!",
          body: "Solve the puzzle or turn off the alarm.",
          sound: "default", // Ensure your channel setup in Context enables sound
          data: { alarmId },
        },
        trigger: {
          date: new Date(triggerTime), // Trigger at specific timestamp
          channelId: "alarm",
        },
      });
      scheduledIds.push(id);
    } catch (e) {
      console.log("Failed to schedule individual nag:", e);
    }
  }

  return scheduledIds; // Return ARRAY of IDs
}

// MODIFIED: Accepts an Array of IDs
export async function cancelNagNotification(nagNotificationIds) {
  if (!nagNotificationIds || !Array.isArray(nagNotificationIds)) return;
  
  try {
    await Promise.all(
      nagNotificationIds.map((id) => 
        Notifications.cancelScheduledNotificationAsync(id)
      )
    );
  } catch (e) {
    console.log("Error cancelling nag notifications:", e);
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