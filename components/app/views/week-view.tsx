"use client";

import {
  addDays,
  differenceInCalendarDays,
  isSameDay,
  startOfWeek,
} from "date-fns";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AllDayEventBar } from "@/components/app/all-day-event-bar";
import { EventCard } from "@/components/app/event-card";
import { useTimeGridCreate } from "@/hooks/use-time-grid-create";
import { formatHourLabel, formatWeekdayShort } from "@/lib/calendar-format";
import {
  layoutOverlappingEvents,
  packAllDaySpans,
} from "@/lib/calendar-layout";
import type { CalendarEvent } from "@/types/calendar";

interface WeekViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onCreateEvent: (start: Date, end: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
  /** Bumped per-event to force a visual reset after a cancelled recurring-scope prompt. */
  eventResetTokens?: Record<string, number>;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;
const ALL_DAY_ROW_HEIGHT = 22;

export function WeekView({
  events,
  selectedDate,
  onCreateEvent,
  onEditEvent,
  onUpdateEvent,
  onDeleteEvent,
  eventResetTokens,
}: WeekViewProps) {
  const gridBodyRef = useRef<HTMLDivElement>(null);
  const dayColumnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  const timedEvents = useMemo(
    () => events.filter((event) => !event.allDay),
    [events],
  );
  const allDayEvents = useMemo(
    () => events.filter((event) => event.allDay),
    [events],
  );

  const {
    preview: dragPreview,
    handleMouseDown: handleCreateMouseDown,
    cancel: cancelCreateDrag,
  } = useTimeGridCreate({
    hourHeight: HOUR_HEIGHT,
    columns: weekDays,
    containerRef: gridBodyRef,
    onCreate: onCreateEvent,
  });

  useEffect(() => {
    if (!dragPreview) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelCreateDrag();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cancelCreateDrag, dragPreview]);

  // Resolves the calendar date under a given clientX, for cross-day drag.
  const getDateAtX = useCallback(
    (clientX: number): Date | null => {
      for (let i = 0; i < dayColumnRefs.current.length; i++) {
        const rect = dayColumnRefs.current[i]?.getBoundingClientRect();
        if (rect && clientX >= rect.left && clientX < rect.right)
          return weekDays[i];
      }
      return null;
    },
    [weekDays],
  );

  const allDayRows = useMemo(() => {
    const weekStart = weekDays[0];
    const weekEnd = weekDays[6];
    const spans = allDayEvents
      .filter((event) => event.end >= weekStart && event.start <= weekEnd)
      .map((event) => ({
        item: event,
        startIdx: Math.max(0, differenceInCalendarDays(event.start, weekStart)),
        endIdx: Math.min(6, differenceInCalendarDays(event.end, weekStart)),
      }));
    return packAllDaySpans(spans);
  }, [allDayEvents, weekDays]);

  const handleAllDayDrop = (e: React.DragEvent, dropDayIndex: number) => {
    e.preventDefault();
    const eventId = e.dataTransfer.getData("text/plain");
    const event = allDayEvents.find((ev) => ev.id === eventId);
    if (!event) return;

    const originalStartIdx = Math.min(
      6,
      Math.max(0, differenceInCalendarDays(event.start, weekDays[0])),
    );
    const deltaDays = dropDayIndex - originalStartIdx;
    if (deltaDays === 0) return;

    onUpdateEvent(event.id, {
      start: addDays(event.start, deltaDays),
      end: addDays(event.end, deltaDays),
    });
  };

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (minutes / 60) * HOUR_HEIGHT;
  };

  const isCurrentDay = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border bg-background">
        <div className="grid grid-cols-[4rem_repeat(7,1fr)]">
          <div className="w-16 border-r border-border" />
          {weekDays.map((day) => (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center justify-center py-2 border-r border-border"
            >
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {formatWeekdayShort(day)}
              </span>
              <span
                className={`mt-1 flex h-10 w-10 items-center justify-center border text-2xl ${
                  isCurrentDay(day)
                    ? "bg-foreground text-background border-foreground"
                    : "border-transparent text-foreground"
                }`}
              >
                {day.getDate()}
              </span>
            </div>
          ))}
        </div>

        {allDayRows.length > 0 && (
          <div className="border-t border-border">
            {allDayRows.map((row, rowIndex) => (
              <div
                key={row.map((span) => span.item.id).join("-")}
                className="grid grid-cols-[4rem_repeat(7,1fr)]"
                style={{ height: ALL_DAY_ROW_HEIGHT }}
              >
                <div className="w-16 border-r border-border flex items-center justify-end pr-2">
                  {rowIndex === 0 && (
                    <span className="text-[10px] text-muted-foreground uppercase">
                      All day
                    </span>
                  )}
                </div>
                {weekDays.map((day, dayIndex) => {
                  const span = row.find((s) => s.startIdx === dayIndex);
                  return (
                    <div
                      key={day.toISOString()}
                      className="relative border-r border-border"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleAllDayDrop(e, dayIndex)}
                    >
                      {span && (
                        <div
                          className="absolute inset-y-0 left-0"
                          style={{
                            width: `${(span.endIdx - span.startIdx + 1) * 100}%`,
                          }}
                        >
                          <AllDayEventBar
                            event={span.item}
                            onEdit={onEditEvent}
                            onDelete={onDeleteEvent}
                            draggable
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1 overflow-auto">
        <div className="grid grid-cols-[4rem_repeat(7,1fr)]" ref={gridBodyRef}>
          <div className="sticky left-0 z-10 bg-background border-r border-border">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="flex h-[60px] items-start justify-end border-b border-border pr-2 pt-1"
              >
                <span className="text-xs text-muted-foreground">
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => (
            <div
              key={day.toISOString()}
              ref={(el) => {
                dayColumnRefs.current[dayIndex] = el;
              }}
              className={`relative border-r border-border ${isCurrentDay(day) ? "bg-accent/40" : ""}`}
              onMouseDown={(e) => handleCreateMouseDown(e, dayIndex)}
            >
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-border hover:bg-accent/50 cursor-crosshair transition-colors"
                />
              ))}

              {(() => {
                const dayEvents = timedEvents.filter((event) =>
                  isSameDay(event.start, day),
                );
                const layout = layoutOverlappingEvents(dayEvents);
                return dayEvents.map((event) => (
                  <EventCard
                    key={`${event.id}:${eventResetTokens?.[event.id] ?? 0}`}
                    event={event}
                    hourHeight={HOUR_HEIGHT}
                    onEdit={onEditEvent}
                    onUpdate={onUpdateEvent}
                    onDelete={onDeleteEvent}
                    getDateAtX={getDateAtX}
                    layout={layout.get(event.id)}
                  />
                ));
              })()}

              {dragPreview && dragPreview.columnIndex === dayIndex && (
                <div
                  className="absolute left-1 right-1 z-10 border-2 border-dashed border-foreground bg-foreground/5 pointer-events-none"
                  style={{
                    top: `${dragPreview.top}px`,
                    height: `${dragPreview.height}px`,
                  }}
                >
                  <div className="p-2 text-xs text-foreground font-mono">
                    New Event
                  </div>
                </div>
              )}

              {isCurrentDay(day) && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: `${getCurrentTimePosition()}px` }}
                >
                  <div className="h-2 w-2 bg-foreground" />
                  <div className="h-px flex-1 bg-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
