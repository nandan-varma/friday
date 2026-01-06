"use client";

import { CalendarGrid } from "@/components/app/calendar/calendar-grid";
import { CalendarSidebar } from "@/components/app/calendar/calendar-sidebar";
import { CalendarToolbar } from "@/components/app/calendar/calendar-toolbar";
import { CalendarSkeleton } from "@/components/app/calendar/calendar-skeleton";
import { EventDialog } from "@/components/app/event/event-dialog";
import { EventDetails } from "@/components/app/event/event-details";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { toast } from "sonner";
import type { Calendar, Event } from "@/db/schema/calendar";
import { useEffect, useState } from "react";
import { startOfMonth, endOfMonth, addMonths, subMonths } from "date-fns";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("month");
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [visibleCalendars, setVisibleCalendars] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogDefaultDate, setDialogDefaultDate] = useState<Date | undefined>();

  // Fetch calendars
  useEffect(() => {
    fetchCalendars();
  }, []);

  // Fetch events when date range or visible calendars change
  useEffect(() => {
    if (calendars.length > 0) {
      fetchEvents();
    }
  }, [currentDate, view, visibleCalendars, calendars]);

  const fetchCalendars = async () => {
    try {
      const response = await fetch("/api/calendars");
      if (!response.ok) throw new Error("Failed to fetch calendars");
      
      const data = await response.json();
      setCalendars(data);
      
      // Set all calendars as visible by default
      setVisibleCalendars(new Set(data.map((cal: Calendar) => cal.id)));
      
      // Create a default calendar if none exist
      if (data.length === 0) {
        await createDefaultCalendar();
      }
    } catch (error) {
      console.error("Error fetching calendars:", error);
      toast.error("Failed to load calendars");
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultCalendar = async () => {
    try {
      const response = await fetch("/api/calendars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Calendar",
          color: "#3b82f6",
          isDefault: true,
          isVisible: true,
        }),
      });

      if (!response.ok) throw new Error("Failed to create calendar");
      
      const newCalendar = await response.json();
      setCalendars([newCalendar]);
      setVisibleCalendars(new Set([newCalendar.id]));
    } catch (error) {
      console.error("Error creating default calendar:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      // Calculate date range based on view
      let start: Date, end: Date;
      
      if (view === "month") {
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
      } else if (view === "week") {
        start = subMonths(currentDate, 1);
        end = addMonths(currentDate, 1);
      } else {
        start = subMonths(currentDate, 1);
        end = addMonths(currentDate, 1);
      }

      const response = await fetch(
        `/api/events?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      
      if (!response.ok) throw new Error("Failed to fetch events");
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(undefined);
    setDialogDefaultDate(currentDate);
    setShowEventDialog(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEventDialog(true);
    setShowEventDetails(false);
  };

  const handleSaveEvent = async (eventData: Partial<Event>) => {
    try {
      const isEditing = !!eventData.id;
      const url = isEditing ? "/api/events" : "/api/events";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) throw new Error("Failed to save event");

      const savedEvent = await response.json();

      // Update events list
      if (isEditing) {
        setEvents((prev) =>
          prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
        );
        toast.success("Event updated");
      } else {
        setEvents((prev) => [...prev, savedEvent]);
        toast.success("Event created");
      }

      setShowEventDialog(false);
      setEditingEvent(undefined);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event");
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      toast.success("Event deleted");
      setShowEventDetails(false);
      setShowEventDialog(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
      throw error;
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleTimeSlotClick = (date: Date, hour?: number) => {
    const newDate = new Date(date);
    if (hour !== undefined) {
      newDate.setHours(hour, 0, 0, 0);
    }
    setDialogDefaultDate(newDate);
    setEditingEvent(undefined);
    setShowEventDialog(true);
  };

  const handleCalendarToggle = (calendarId: string) => {
    setVisibleCalendars((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(calendarId)) {
        newSet.delete(calendarId);
      } else {
        newSet.add(calendarId);
      }
      return newSet;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Filter events by visible calendars
  const filteredEvents = events.filter((event) =>
    visibleCalendars.has(event.calendarId)
  );

  // Create calendar map for colors
  const calendarMap = new Map(
    calendars.map((cal) => [cal.id, { color: cal.color, name: cal.name }])
  );

  const selectedEventCalendar = selectedEvent
    ? calendars.find((cal) => cal.id === selectedEvent.calendarId)
    : undefined;

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <SidebarProvider>
      <CalendarSidebar
        calendars={calendars}
        selectedDate={currentDate}
        onDateSelect={(date) => date && setCurrentDate(date)}
        visibleCalendars={visibleCalendars}
        onCalendarToggle={handleCalendarToggle}
        onCreateEvent={handleCreateEvent}
      />
      <SidebarInset>
        <div className="flex h-screen flex-col">
          <CalendarToolbar
            currentDate={currentDate}
            view={view}
            onDateChange={setCurrentDate}
            onViewChange={setView}
            onCreateEvent={handleCreateEvent}
            onToday={handleToday}
          />
          <div className="flex-1 overflow-hidden">
            <CalendarGrid
              currentDate={currentDate}
              view={view}
              events={filteredEvents}
              onEventClick={handleEventClick}
              onTimeSlotClick={handleTimeSlotClick}
              calendars={calendarMap}
            />
          </div>
        </div>
      </SidebarInset>

      {/* Event Dialog */}
      <EventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        event={editingEvent}
        calendars={calendars}
        defaultDate={dialogDefaultDate}
        onSave={handleSaveEvent}
        onDelete={editingEvent ? () => handleDeleteEvent(editingEvent.id) : undefined}
      />

      {/* Event Details Sheet */}
      <EventDetails
        open={showEventDetails}
        onOpenChange={setShowEventDetails}
        event={selectedEvent}
        calendar={selectedEventCalendar}
        onEdit={() => handleEditEvent(selectedEvent!)}
        onDelete={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
      />
    </SidebarProvider>
  );
}
