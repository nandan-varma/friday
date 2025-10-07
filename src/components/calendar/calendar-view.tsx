"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, List, Grid3X3, Clock } from "lucide-react"
import { MonthView } from "./month-view"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { AgendaView } from "./agenda-view"
import { UnifiedEvent } from "@/lib/eventService"

interface CalendarViewProps {
  events: UnifiedEvent[]
  onEventClick: (event: UnifiedEvent) => void
  onCreateEvent: (date: Date, time?: Date) => void
}

export function CalendarView({ events, onEventClick, onCreateEvent }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')

  const handleDateChange = (date: Date) => {
    setCurrentDate(date)
  }

  return (
    <div className="space-y-6">
      {/* View Selector */}
      <Tabs value={view} onValueChange={(value) => setView(value as typeof view)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="month" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Month
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Week
          </TabsTrigger>
          <TabsTrigger value="day" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Day
          </TabsTrigger>
          <TabsTrigger value="agenda" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Agenda
          </TabsTrigger>
        </TabsList>

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
  )
}