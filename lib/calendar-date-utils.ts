// Calendar-view-aware date navigation. Everything else date-related in this
// app (comparisons, arithmetic, formatting, parsing) goes straight through
// date-fns - this is the one bit of date math that's specific to us, since
// "next"/"previous" depends on which view is active.

import { addDays, addMonths, addWeeks } from "date-fns";

export type CalendarViewMode = "day" | "week" | "month" | "agenda";

export function shiftDate(
  date: Date,
  viewMode: CalendarViewMode,
  direction: 1 | -1,
): Date {
  switch (viewMode) {
    case "day":
      return addDays(date, direction);
    case "week":
      return addWeeks(date, direction);
    case "month":
      return addMonths(date, direction);
    case "agenda":
      return addDays(date, direction * 30);
  }
}
