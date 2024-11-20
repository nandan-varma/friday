"use client";

import { useState } from "react";
import { CalendarEvent } from "@/lib/types";
import { CalendarGrid } from "./CalendarGrid";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addWeeks, subWeeks } from "date-fns";

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // Ensure consistent date by removing time component
    now.setHours(0, 0, 0, 0);
    return now;
  });

  const handleEventAdd = (newEvent: Partial<CalendarEvent>) => {
    setEvents((prev) => [
      ...prev,
      {
        ...newEvent,
        id: Math.random().toString(36).substr(2, 9),
        start: newEvent.start!,
        end: newEvent.end!,
        title: newEvent.title || "Untitled Event",
      },
    ]);
  };

  const handleEventUpdate = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? { ...event, ...updates }
          : event
      )
    );
  };

  const handlePrevWeek = () => {
    setCurrentDate(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(prev => addWeeks(prev, 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-5 w-5" />
            <span>{format(currentDate, "MMMM yyyy")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="border rounded-lg overflow-auto">
        <CalendarGrid 
          currentDate={currentDate}
          events={events} 
          onEventAdd={handleEventAdd} 
          onEventUpdate={handleEventUpdate}
        />
      </div>
    </div>
  );
}