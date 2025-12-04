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

const parseDateInput = (input) => {
  if (!input) {
    return null;
  }

  if (input instanceof Date) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate(), 0, 0, 0, 0);
  }

  if (typeof input === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [year, month, day] = input.split('-').map(Number);
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    const parsed = new Date(input);
    if (!Number.isNaN(parsed.getTime())) {
      if (input.includes('T')) {
        return new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
      }
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0);
    }
  }

  return null;
};

const parseTimeString = (timeString) => {
  if (typeof timeString !== 'string' || !timeString.includes(':')) {
    throw new Error('Invalid time input');
  }

  const [hours, minutes] = timeString.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error('Invalid time input');
  }

  return { hours, minutes };
};

export const getTriggerDate = (dateInput, timeString) => {
  try {
    if (!timeString) {
      throw new Error('Invalid date/time input');
    }

    const dateObj = parseDateInput(dateInput);
    if (!dateObj) {
      throw new Error('Invalid date/time input');
    }

    const { hours, minutes } = parseTimeString(timeString);
    dateObj.setHours(hours || 0, minutes || 0, 0, 0);
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

export async function scheduleTaskNotification(title, dateValue, timeString) {
  const triggerDate = getTriggerDate(dateValue, timeString);
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