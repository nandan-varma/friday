// Centralized display formatting so every view renders times/dates the same
// way. All formatting happens in the viewer's own device timezone - that's
// just what `Date` + date-fns already do by operating on local getters, no
// conversion required.
import { format } from "date-fns";

/** "9:05AM" */
export function formatEventTime(date: Date): string {
  return format(date, "h:mma");
}

/** "9AM", "12PM" - used for hour-row labels in Day/Week views. */
export function formatHourLabel(hour: number): string {
  return format(new Date(2000, 0, 1, hour), "ha");
}

/** "Mon", "Tue" */
export function formatWeekdayShort(date: Date): string {
  return format(date, "EEE");
}

/** "Monday" */
export function formatWeekdayLong(date: Date): string {
  return format(date, "EEEE");
}

/** "August 2026" */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

/** "Monday, August 29, 2026" */
export function formatFullDate(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}
