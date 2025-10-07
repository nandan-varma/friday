"use client";

import { useState } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  setHours,
  setMinutes,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedEvent } from "@/lib/services/eventService";

interface WeekViewProps {
  currentDate: Date;
  events: UnifiedEvent[];
  onDateChange: (date: Date) => void;
  onEventClick: (event: UnifiedEvent) => void;
  onCreateEvent: (date: Date, time?: Date) => void;
}

export function WeekView({
  currentDate,
  events,
  onDateChange,
  onEventClick,
  onCreateEvent,
}: WeekViewProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDate = (date: Date) => {
    return events
      .filter((event) => isSameDay(new Date(event.startTime), date))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  };

  const getEventsForTimeSlot = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      const slotStart = setMinutes(setHours(date, hour), 0);
      const slotEnd = setMinutes(setHours(date, hour + 1), 0);

      return (
        (eventStart >= slotStart && eventStart < slotEnd) ||
        (eventEnd > slotStart && eventEnd <= slotEnd) ||
        (eventStart <= slotStart && eventEnd >= slotEnd)
      );
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subWeeks(currentDate, 1)
        : addWeeks(currentDate, 1);
    onDateChange(newDate);
  };

  const getEventPosition = (event: UnifiedEvent, hour: number) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    const slotStart = setMinutes(setHours(eventStart, hour), 0);

    const startOffset =
      (eventStart.getTime() - slotStart.getTime()) / (60 * 60 * 1000); // Hours offset
    const duration =
      (eventEnd.getTime() - eventStart.getTime()) / (60 * 60 * 1000); // Duration in hours

    return { startOffset, duration };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={() => onCreateEvent(currentDate)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Week Calendar */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-8 min-h-[600px]">
            {/* Time column */}
            <div className="border-r">
              <div className="h-12 border-b flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  Time
                </span>
              </div>
              <ScrollArea className="h-[552px]">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 border-b flex items-center justify-center"
                  >
                    <span className="text-xs text-muted-foreground">
                      {format(setHours(new Date(), hour), "h a")}
                    </span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            {/* Day columns */}
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());

              return (
                <div key={day.toISOString()} className="border-r">
                  {/* Day header */}
                  <div
                    className={cn(
                      "h-12 border-b flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50",
                      isToday && "bg-primary/10",
                    )}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isToday && "text-primary font-bold",
                      )}
                    >
                      {format(day, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "text-lg font-bold",
                        isToday && "text-primary",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Time slots */}
                  <ScrollArea className="h-[552px]">
                    {hours.map((hour) => {
                      const slotEvents = getEventsForTimeSlot(day, hour);

                      return (
                        <div
                          key={hour}
                          className="h-12 border-b relative cursor-pointer hover:bg-muted/30"
                          onClick={() =>
                            onCreateEvent(
                              day,
                              setHours(setMinutes(day, 0), hour),
                            )
                          }
                        >
                          {slotEvents.map((event, index) => {
                            const { startOffset, duration } = getEventPosition(
                              event,
                              hour,
                            );
                            const top = startOffset * 48; // 48px per hour
                            const height = Math.max(duration * 48, 24); // Minimum height

                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute left-0 right-0 mx-1 rounded text-xs p-1 cursor-pointer hover:opacity-80 overflow-hidden",
                                  event.origin === "google"
                                    ? "bg-blue-100 text-blue-800 border-l-2 border-blue-500"
                                    : "bg-green-100 text-green-800 border-l-2 border-green-500",
                                )}
                                style={{
                                  top: `${top}px`,
                                  height: `${height}px`,
                                  zIndex: 10 + index,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEventClick(event);
                                }}
                                title={`${event.title} (${format(new Date(event.startTime), "h:mm a")} - ${format(new Date(event.endTime), "h:mm a")})`}
                              >
                                <div className="font-medium truncate">
                                  {event.title}
                                </div>
                                {height > 32 && (
                                  <div className="text-xs opacity-75">
                                    {format(
                                      new Date(event.startTime),
                                      "h:mm a",
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected date events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Events for {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No events scheduled for this day</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => onCreateEvent(selectedDate)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Event
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.startTime), "h:mm a")} -{" "}
                        {format(new Date(event.endTime), "h:mm a")}
                        {event.location && ` • ${event.location}`}
                      </p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={
                        event.origin === "google" ? "default" : "secondary"
                      }
                    >
                      {event.origin}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
