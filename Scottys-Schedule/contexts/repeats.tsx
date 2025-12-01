import React, { useState } from 'react'


const dayToNumber: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

export function getNextRepeatDate(currentDate: Date, repeats: string[], taskEndTime: string): Date {
  if (repeats.length === 0) {
    return currentDate;
  }

  const today = currentDate.getDay(); // 0–6
  const repeatNumbers = repeats.map(day => dayToNumber[day]); // → [1,4,..]

  const [endHour, endMinute] = taskEndTime.split(':').map(Number);

  let minDiff = Infinity;
  let targetDay = today;

  repeatNumbers.forEach(dayNum => {
    let diff = (dayNum - today + 7) % 7; // days until next occurrence

    if (diff === 0) {
      if (
        currentDate.getHours() > endHour ||
        (currentDate.getHours() === endHour && currentDate.getMinutes() >= endMinute)
      ) {
        diff = 7; // move to next week
      } else {
        diff = 0; // still today
      }
    }

    if (diff < minDiff) {
      minDiff = diff;
      targetDay = dayNum;
    }
  });

  // If today is a repeat day → schedule next week
  if (minDiff === Infinity) minDiff = 7;

  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + minDiff);
  nextDate.setHours(0, 0, 0, 0)
  return nextDate || new Date(currentDate);
}

