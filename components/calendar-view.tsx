'use client';

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format, parse, isSameDay, addMonths, startOfMonth } from 'date-fns';

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventsChange?: (events: CalendarEvent[]) => void;
  readOnly?: boolean;
}

export function CalendarView({
  events = [],
  onEventsChange,
  readOnly = false,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Convert string dates to Date objects
  const formattedEvents = events.map((event) => ({
    ...event,
    startDate: new Date(event.start),
    endDate: new Date(event.end),
  }));

  // Get events for selected date
  const eventsForSelectedDate = selectedDate
    ? formattedEvents.filter(
        (event) =>
          isSameDay(event.startDate, selectedDate) ||
          isSameDay(event.endDate, selectedDate),
      )
    : [];

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  // Handle adding new event
  const handleAddEvent = () => {
    if (!selectedDate || readOnly) return;

    const newDate = selectedDate;
    const startTime = new Date(newDate);
    startTime.setHours(9, 0, 0);

    const endTime = new Date(newDate);
    endTime.setHours(10, 0, 0);

    setIsNewEvent(true);
    setSelectedEvent({
      title: '',
      start: startTime.toISOString(),
      end: endTime.toISOString(),
      allDay: false,
      description: '',
    });
    setShowDialog(true);
  };

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    setIsNewEvent(false);
    setSelectedEvent(event);
    setShowDialog(true);
  };

  // Handle saving event
  const handleSaveEvent = () => {
    if (!selectedEvent) return;

    if (isNewEvent) {
      const newEvents = [...events, selectedEvent];
      onEventsChange?.(newEvents);
    } else {
      const newEvents = events.map((event) => {
        const startMatch = event.start === selectedEvent.start;
        const endMatch = event.end === selectedEvent.end;

        if (startMatch && endMatch && event.title === selectedEvent.title) {
          return selectedEvent;
        }
        return event;
      });
      onEventsChange?.(newEvents);
    }

    setShowDialog(false);
    setSelectedEvent(null);
  };

  // Handle deleting event
  const handleDeleteEvent = () => {
    if (!selectedEvent || isNewEvent) return;

    const newEvents = events.filter((event) => {
      const startMatch = event.start === selectedEvent.start;
      const endMatch = event.end === selectedEvent.end;

      return !(startMatch && endMatch && event.title === selectedEvent.title);
    });

    onEventsChange?.(newEvents);
    setShowDialog(false);
    setSelectedEvent(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!selectedEvent) return;

    setSelectedEvent({
      ...selectedEvent,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    if (!selectedEvent) return;

    setSelectedEvent({
      ...selectedEvent,
      allDay: checked,
    });
  };

  // Function to render event indicators on calendar days
  const renderEventIndicator = (day: Date) => {
    const eventsOnThisDay = formattedEvents.filter(
      (event) =>
        isSameDay(event.startDate, day) || isSameDay(event.endDate, day),
    );

    if (eventsOnThisDay.length > 0) {
      return {
        className: 'bg-primary h-1.5 w-1.5 rounded-full absolute -bottom-1',
      };
    }
    return {};
  };

  // Navigation between months
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[600px]">
      <div className="w-full lg:w-1/2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Calendar</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  Next
                </Button>
              </div>
            </div>
            <CardDescription>
              {format(currentMonth, 'MMMM yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border shadow"
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              modifiers={{
                hasEvent: (date) =>
                  formattedEvents.some(
                    (event) =>
                      isSameDay(new Date(event.start), date) ||
                      isSameDay(new Date(event.end), date),
                  ),
              }}
              modifiersClassNames={{
                hasEvent: 'relative',
              }}
              components={{
                DayContent: (props) => (
                  <div className="relative">
                    {props.date.toLocaleDateString('en-US', {
                      day: 'numeric',
                    })}
                    {formattedEvents.some((event) =>
                      isSameDay(new Date(event.start), props.date),
                    ) && (
                      <div className="bg-primary h-1 w-1 rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2" />
                    )}
                  </div>
                ),
              }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="w-full lg:w-1/2 overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Events'}
              </CardTitle>
              {!readOnly && (
                <Button size="sm" onClick={handleAddEvent}>
                  Add Event
                </Button>
              )}
            </div>
            <CardDescription>
              {eventsForSelectedDate.length === 0
                ? 'No events scheduled'
                : `${eventsForSelectedDate.length} event${
                    eventsForSelectedDate.length > 1 ? 's' : ''
                  }`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {selectedDate
                  ? 'No events scheduled for this date'
                  : 'Select a date to view events'}
              </p>
            ) : (
              <div className="space-y-4">
                {eventsForSelectedDate.map((event, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => !readOnly && handleSelectEvent(event)}
                  >
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">{event.title}</CardTitle>
                      <CardDescription>
                        {event.allDay
                          ? 'All day'
                          : `${format(
                              new Date(event.start),
                              'h:mm a',
                            )} - ${format(new Date(event.end), 'h:mm a')}`}
                      </CardDescription>
                    </CardHeader>
                    {event.description && (
                      <CardContent className="py-2">
                        <p className="text-sm text-muted-foreground">
                          {event.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showDialog && selectedEvent && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isNewEvent ? 'Add Event' : 'Edit Event'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={selectedEvent.title}
                  onChange={handleInputChange}
                  placeholder="Event title"
                  disabled={readOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="start">Start</Label>
                <Input
                  id="start"
                  name="start"
                  type="datetime-local"
                  value={format(
                    new Date(selectedEvent.start),
                    "yyyy-MM-dd'T'HH:mm",
                  )}
                  onChange={(e) => {
                    const date = e.target.value;
                    setSelectedEvent({
                      ...selectedEvent,
                      start: new Date(date).toISOString(),
                    });
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End</Label>
                <Input
                  id="end"
                  name="end"
                  type="datetime-local"
                  value={format(
                    new Date(selectedEvent.end),
                    "yyyy-MM-dd'T'HH:mm",
                  )}
                  onChange={(e) => {
                    const date = e.target.value;
                    setSelectedEvent({
                      ...selectedEvent,
                      end: new Date(date).toISOString(),
                    });
                  }}
                  disabled={readOnly}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allDay"
                  checked={selectedEvent.allDay || false}
                  onCheckedChange={handleCheckboxChange}
                  disabled={readOnly}
                />
                <Label htmlFor="allDay">All day event</Label>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={selectedEvent.description || ''}
                  onChange={handleInputChange}
                  placeholder="Event description"
                  disabled={readOnly}
                />
              </div>
            </div>
            {!readOnly && (
              <DialogFooter>
                {!isNewEvent && (
                  <Button variant="destructive" onClick={handleDeleteEvent}>
                    Delete
                  </Button>
                )}
                <Button onClick={handleSaveEvent}>Save</Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
