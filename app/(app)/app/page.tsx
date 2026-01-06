"use client"

import { useState } from "react"
import { CalendarHeader } from "@/components/app/calendar-header"
import { CalendarSidebar } from "@/components/app/calendar-sidebar"
import { CalendarGrid } from "@/components/app/calendar-grid"
import { EventDialog } from "@/components/app/event-dialog"
import type { Calendar, CalendarEvent } from "@/types/calendar"

const INITIAL_CALENDARS: Calendar[] = [
  { id: "personal", name: "Personal", color: "blue", checked: true },
  { id: "work", name: "Work", color: "amber", checked: true },
  { id: "classes", name: "Classes", color: "green", checked: true },
  { id: "birthdays", name: "Birthdays", color: "pink", checked: true },
]

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: "1",
    title: "Flight to Seattle (AA 707)",
    description: "Dallas DFW",
    start: new Date(2026, 0, 7, 7, 10),
    end: new Date(2026, 0, 7, 11, 37),
    calendarId: "work",
    color: "amber",
  },
  {
    id: "2",
    title: "CPSC-5260-01 Refactoring & Sof",
    start: new Date(2026, 0, 8, 20, 0),
    end: new Date(2026, 0, 8, 22, 5),
    calendarId: "classes",
    color: "green",
  },
]

export default function CalendarPage() {
  const [calendars, setCalendars] = useState<Calendar[]>(INITIAL_CALENDARS)
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS)
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 6))
  const [viewMode, setViewMode] = useState<"day" | "week" | "month" | "agenda">("week")
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [dialogInitialData, setDialogInitialData] = useState<{
    start: Date
    end: Date
  } | null>(null)

  const handleToggleCalendar = (calendarId: string) => {
    setCalendars((prev) => prev.map((cal) => (cal.id === calendarId ? { ...cal, checked: !cal.checked } : cal)))
  }

  const handleCreateEvent = (start: Date, end: Date) => {
    setDialogInitialData({ start, end })
    setSelectedEvent(null)
    setEventDialogOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setDialogInitialData(null)
    setEventDialogOpen(true)
  }

  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      setEvents((prev) => prev.map((e) => (e.id === selectedEvent.id ? ({ ...e, ...eventData } as CalendarEvent) : e)))
    } else {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: eventData.title || "Untitled Event",
        description: eventData.description,
        start: eventData.start || new Date(),
        end: eventData.end || new Date(),
        calendarId: eventData.calendarId || "personal",
        color: calendars.find((c) => c.id === eventData.calendarId)?.color || "blue",
      }
      setEvents((prev) => [...prev, newEvent])
    }
    setEventDialogOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
    setEventDialogOpen(false)
  }

  const handleUpdateEvent = (eventId: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e)))
  }

  const visibleEvents = events.filter((event) => calendars.find((cal) => cal.id === event.calendarId)?.checked)

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background dark">
      <CalendarSidebar
        calendars={calendars}
        onToggleCalendar={handleToggleCalendar}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <CalendarHeader
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <CalendarGrid
          events={visibleEvents}
          selectedDate={selectedDate}
          viewMode={viewMode}
          onCreateEvent={handleCreateEvent}
          onEditEvent={handleEditEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      </div>

      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={selectedEvent}
        initialData={dialogInitialData}
        calendars={calendars}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  )
}
