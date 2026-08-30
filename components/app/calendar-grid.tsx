"use client";
import { AgendaView } from "@/components/app/views/agenda-view";
import { DayView } from "@/components/app/views/day-view";
import { MonthView } from "@/components/app/views/month-view";
import { WeekView } from "@/components/app/views/week-view";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  viewMode: "day" | "week" | "month" | "agenda";
  onCreateEvent: (
    start: Date,
    end: Date,
    options?: { allDay?: boolean },
  ) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  /** Bumped per-event to force a visual reset after a cancelled recurring-scope prompt. */
  eventResetTokens?: Record<string, number>;
}

export function CalendarGrid({
  events,
  selectedDate,
  viewMode,
  onCreateEvent,
  onEditEvent,
  onUpdateEvent,
  onDeleteEvent,
  eventResetTokens,
}: CalendarGridProps) {
  const viewProps = {
    events,
    selectedDate,
    onCreateEvent,
    onEditEvent,
    onUpdateEvent,
    onDeleteEvent,
    eventResetTokens,
  };

  switch (viewMode) {
    case "day":
      return <DayView {...viewProps} />;
    case "week":
      return <WeekView {...viewProps} />;
    case "month":
      return <MonthView {...viewProps} />;
    case "agenda":
      return <AgendaView {...viewProps} />;
    default:
      return <WeekView {...viewProps} />;
  }
}
