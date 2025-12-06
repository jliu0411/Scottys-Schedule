import { DAY_TO_INDEX } from "./alarmConstants";

export const mapDocToAlarm = (doc) => ({
  id: doc.$id,                  
  time: doc.timer != null ? doc.timer * 1000 : doc.timer, 
  repeatDays: doc.repeatDays || [],
  puzzle: doc.puzzle ?? false,
  enabled: doc.enabled ?? true,
  notificationIds: [],
  nextTriggerMs: null,
});

export const getNextTriggerTimeMs = (
  repeatDays,
  hour,
  minute,
  startFrom = new Date()
) => {
  const start = new Date(startFrom);
  const baseToday = new Date(start);
  baseToday.setHours(hour);
  baseToday.setMinutes(minute);
  baseToday.setSeconds(0);
  baseToday.setMilliseconds(0);

  const candidates = (repeatDays ?? [])
    .map((day) => DAY_TO_INDEX[day])
    .filter((idx) => idx != null);

  if (candidates.length === 0) {
    if (baseToday > start) return baseToday.getTime();
    const tomorrow = new Date(baseToday);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getTime();
  }

  let best = null;
  for (const dayIndex of candidates) {
    const candidate = new Date(baseToday);
    const offset = (dayIndex - start.getDay() + 7) % 7;
    candidate.setDate(candidate.getDate() + offset);
    if (candidate <= start) candidate.setDate(candidate.getDate() + 7);
    const ms = candidate.getTime();
    if (best == null || ms < best) best = ms;
  }

  return best;
};
