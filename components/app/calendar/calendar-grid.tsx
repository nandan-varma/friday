"use client";

import * as React from "react";
import { EventCard } from "@/components/app/event/event-card";
import { cn } from "@/lib/utils";
import type { Event } from "@/db/schema/calendar";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  startOfDay,
  endOfDay,
  isWithinInterval,
} from "date-fns";

interface CalendarGridProps {
  currentDate: Date;
  view: "day" | "week" | "month";
  events: Event[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
  calendars?: Map<string, { color: string; name: string }>;
}

export function CalendarGrid({
  currentDate,
  view,
  events,
  onEventClick,
  onTimeSlotClick,
  calendars,
}: CalendarGridProps) {
  // Enrich events with calendar colors
  const enrichedEvents = events.map((event) => ({
    ...event,
    calendarColor: calendars?.get(event.calendarId)?.color,
  }));

  if (view === "month") {
    return <MonthView currentDate={currentDate} events={enrichedEvents} onEventClick={onEventClick} />;
  }

  if (view === "week") {
    return (
      <WeekView
        currentDate={currentDate}
        events={enrichedEvents}
        onEventClick={onEventClick}
        onTimeSlotClick={onTimeSlotClick}
      />
    );
  }

  return (
    <DayView
      currentDate={currentDate}
      events={enrichedEvents}
      onEventClick={onEventClick}
      onTimeSlotClick={onTimeSlotClick}
    />
  );
}

// Month View Component
function MonthView({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: (Event & { calendarColor?: string })[];
  onEventClick: (event: Event) => void;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventStart = startOfDay(new Date(event.start));
      const eventEnd = endOfDay(new Date(event.end));
      return isWithinInterval(day, { start: eventStart, end: eventEnd });
    });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="border-r p-2 text-center text-xs font-medium last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-5">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={i}
              className={cn(
                "min-h-[100px] border-b border-r p-2 last:border-r-0",
                !isCurrentMonth && "bg-muted/30",
                isCurrentDay && "bg-accent/10"
              )}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-sm",
                    isCurrentDay && "bg-primary text-primary-foreground font-semibold",
                    !isCurrentMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    variant="grid"
                  />
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-muted-foreground px-1.5 text-xs">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Week View Component
function WeekView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: {
  currentDate: Date;
  events: (Event & { calendarColor?: string })[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
}) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      if (event.allDay) return false;
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return isSameDay(eventStart, day) && eventHour === hour;
    });
  };

  const getAllDayEvents = (day: Date) => {
    return events.filter((event) => {
      if (!event.allDay) return false;
      const eventStart = startOfDay(new Date(event.start));
      const eventEnd = endOfDay(new Date(event.end));
      return isWithinInterval(day, { start: eventStart, end: eventEnd });
    });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header with dates */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
        <div className="border-r p-2" />
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "border-r p-2 text-center last:border-r-0",
              isToday(day) && "bg-accent/10"
            )}
          >
            <div className="text-xs font-medium">{format(day, "EEE")}</div>
            <div
              className={cn(
                "mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm",
                isToday(day) && "bg-primary text-primary-foreground font-semibold"
              )}
            >
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      {/* All-day events row */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
        <div className="text-muted-foreground border-r p-2 text-xs">All day</div>
        {weekDays.map((day) => {
          const allDayEvents = getAllDayEvents(day);
          return (
            <div key={day.toISOString()} className="border-r p-1 last:border-r-0">
              {allDayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => onEventClick(event)}
                  variant="grid"
                  className="mb-1"
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {hours.map((hour) => (
            <React.Fragment key={`hour-${hour}`}>
              <div
                key={`time-${hour}`}
                className="text-muted-foreground sticky left-0 border-b border-r bg-background p-2 text-xs"
              >
                {format(new Date().setHours(hour, 0), "h a")}
              </div>
              {weekDays.map((day) => {
                const hourEvents = getEventsForDayAndHour(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="min-h-[60px] border-b border-r p-1 last:border-r-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => onTimeSlotClick?.(day, hour)}
                  >
                    {hourEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        variant="grid"
                        className="mb-1"
                      />
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// Day View Component
function DayView({
  currentDate,
  events,
  onEventClick,
  onTimeSlotClick,
}: {
  currentDate: Date;
  events: (Event & { calendarColor?: string })[];
  onEventClick: (event: Event) => void;
  onTimeSlotClick?: (date: Date, hour?: number) => void;
}) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForHour = (hour: number) => {
    return events.filter((event) => {
      if (event.allDay) return false;
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return isSameDay(eventStart, currentDate) && eventHour === hour;
    });
  };

  const allDayEvents = events.filter((event) => {
    if (!event.allDay) return false;
    const eventStart = startOfDay(new Date(event.start));
    const eventEnd = endOfDay(new Date(event.end));
    return isWithinInterval(currentDate, { start: eventStart, end: eventEnd });
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b p-4">
          <div className="text-muted-foreground mb-2 text-xs font-medium">All day</div>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
                variant="list"
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => {
          const hourEvents = getEventsForHour(hour);
          return (
            <div key={hour} className="flex border-b">
              <div className="text-muted-foreground w-[80px] shrink-0 border-r p-3 text-xs">
                {format(new Date().setHours(hour, 0), "h:mm a")}
              </div>
              <div
                className="min-h-[80px] flex-1 p-2 hover:bg-muted/30 cursor-pointer"
                onClick={() => onTimeSlotClick?.(currentDate, hour)}
              >
                {hourEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                    variant="list"
                    className="mb-2"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
