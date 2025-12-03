import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export const getTriggerDate = (dateString, timeString) => {
  try {
    const dateObj = new Date(dateString);
    const [hours, minutes] = timeString.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  } catch (e) {
    console.error("Error parsing date/time for notification", e);
    return null;
  }
};

export async function registerForNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminders', {
      name: 'Task Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get permissions for notifications!');
    return false;
  }
  return true;
}

export async function scheduleTaskNotification(title, dateString, timeString) {
  const triggerDate = getTriggerDate(dateString, timeString);
  const now = new Date();

  if (!triggerDate || triggerDate <= now) {
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Task Reminder",
        body: `It's time to: ${title}`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate, 
        channelId: 'task-reminders',
      },
    });
    console.log("Scheduled notification with ID:", id);
    return id;
  } catch (error) {
    console.error("Error scheduling notification:", error);
    return null;
  }
}

export async function cancelTaskNotification(notificationId) {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log("Cancelled notification:", notificationId);
  } catch (error) {
    console.error("Error cancelling notification:", error);
  }
}