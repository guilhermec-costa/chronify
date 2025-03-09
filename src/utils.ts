import { toZonedTime } from "date-fns-tz";

export function dateComponents(date: Date) {
  const second = date.getSeconds();
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 0;
  const dayOfWeek = date.getDay();

  return {
    second,
    minute,
    hour,
    dayOfMonth,
    month,
    dayOfWeek,
  };
}

export function getTzNow(tz: string) {
  return toZonedTime(new Date(), tz);
}
