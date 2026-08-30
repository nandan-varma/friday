"use client";
import { differenceInMinutes } from "date-fns";
import { Calendar, Clock, Repeat } from "lucide-react";
import { formatEventTime, formatFullDate } from "@/lib/calendar-format";
import type { CalendarEvent } from "@/types/calendar";

interface AgendaViewProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onCreateEvent: (start: Date, end: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onUpdateEvent: (eventId: string, updates: Partial<CalendarEvent>) => void;
  onDeleteEvent: (event: CalendarEvent) => void;
}

function formatDuration(start: Date, end: Date): string {
  const totalMinutes = differenceInMinutes(end, start);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "border-l-blue-600",
  amber: "border-l-amber-600",
  green: "border-l-emerald-700",
  pink: "border-l-fuchsia-700",
};

export function AgendaView({
  events,
  onEditEvent,
  onDeleteEvent,
}: AgendaViewProps) {
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.start >= now)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const groupedEvents = new Map<string, CalendarEvent[]>();
  for (const event of upcomingEvents) {
    const dateKey = formatFullDate(event.start);
    const group = groupedEvents.get(dateKey);
    if (group) group.push(event);
    else groupedEvents.set(dateKey, [event]);
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <Calendar className="mx-auto h-16 w-16 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No upcoming events
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an event to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {[...groupedEvents.entries()].map(([dateKey, dateEvents]) => (
          <div key={dateKey}>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {dateKey}
            </h2>
            <div className="space-y-3">
              {dateEvents.map((event) => (
                <div
                  key={event.id}
                  role="button"
                  tabIndex={0}
                  className={`border-l-4 p-4 cursor-pointer transition-colors hover:bg-accent/40 bg-card border border-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring ${
                    COLOR_CLASSES[event.color] ?? "border-l-muted-foreground"
                  }`}
                  onClick={() => onEditEvent(event)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onEditEvent(event);
                    } else if (
                      (e.key === "Delete" || e.key === "Backspace") &&
                      event.editable !== false
                    ) {
                      e.preventDefault();
                      onDeleteEvent(event);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
                        {event.recurringEventId && (
                          <Repeat className="h-4 w-4 shrink-0 opacity-70" />
                        )}
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>
                            {event.allDay
                              ? "All day"
                              : `${formatEventTime(event.start)} - ${formatEventTime(event.end)}`}
                          </span>
                        </div>
                        {!event.allDay && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDuration(event.start, event.end)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
