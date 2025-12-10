"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, List, Grid3X3, Clock } from "lucide-react";

import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { AgendaView } from "./agenda-view";
import { UnifiedEvent } from "@/lib/services/eventService";

interface CalendarViewProps {
  events: UnifiedEvent[];
  onEventClick: (event: UnifiedEvent) => void;
  onCreateEvent: (date: Date, time?: Date) => void;
}

export function CalendarView({
  events,
  onEventClick,
  onCreateEvent,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined);
  const [view, setView] = useState<"month" | "week" | "day" | "agenda">(
    "month",
  );

  // Initialize currentDate on client side to avoid hydration mismatch
  useEffect(() => {
    if (!currentDate) {
      setCurrentDate(new Date());
    }
  }, [currentDate]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  if (!currentDate) {
    return <div className="space-y-4">Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={view}
        onValueChange={(value) =>
          setView(value as "month" | "week" | "day" | "agenda")
        }
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Calendar</h2>
          <TabsList>
            <TabsTrigger value="month">
              <Calendar className="w-4 h-4 mr-2" />
              Month
            </TabsTrigger>
            <TabsTrigger value="week">
              <Grid3X3 className="w-4 h-4 mr-2" />
              Week
            </TabsTrigger>
            <TabsTrigger value="day">
              <Clock className="w-4 h-4 mr-2" />
              Day
            </TabsTrigger>
            <TabsTrigger value="agenda">
              <List className="w-4 h-4 mr-2" />
              Agenda
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="month" className="mt-6">
          <MonthView
            currentDate={currentDate}
            events={events}
            onDateChange={handleDateChange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-6">
          <WeekView
            currentDate={currentDate}
            events={events}
            onDateChange={handleDateChange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
        </TabsContent>

        <TabsContent value="day" className="mt-6">
          <DayView
            currentDate={currentDate}
            events={events}
            onDateChange={handleDateChange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
        </TabsContent>

        <TabsContent value="agenda" className="mt-6">
          <AgendaView
            currentDate={currentDate}
            events={events}
            onDateChange={handleDateChange}
            onEventClick={onEventClick}
            onCreateEvent={onCreateEvent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
