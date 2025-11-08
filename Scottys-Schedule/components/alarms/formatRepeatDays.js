export function formatRepeatDays(days) {
  if(!days || days.length === 0)   
    return "Select Days";

  if(days.length === 7) 
    return "Everyday";

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weekends = ["Sun", "Sat"];

  if (days.length === 5 && weekdays.every((d) => days.includes(d)))
    return "Weekdays";

  if (days.length === 2 && weekends.every((d) => days.includes(d)))
    return "Weekends";

  return days.join(", ");
}
