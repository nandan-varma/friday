"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, isSameDay, isToday, setHours, setMinutes, parseISO } from "date-fns";
import { CalendarEvent, DragState, TIME_SLOTS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { EventModal } from "./EventModal";
import { CalendarEventComponent } from "./CalendarEvent";

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventAdd: (event: Partial<CalendarEvent>) => void;
  onEventUpdate: (eventId: string, updates: Partial<CalendarEvent>) => void;
}

export function CalendarGrid({ currentDate, events, onEventAdd, onEventUpdate }: CalendarGridProps) {
  const [dragState, setDragState] = useState<DragState>({
    startDate: null,
    endDate: null,
    isDragging: false,
  });
  const [showModal, setShowModal] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  // Create a reference date at midnight for consistent time formatting
  const referenceDate = new Date();
  referenceDate.setHours(0, 0, 0, 0);

  const getDaysInWeek = (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const currentWeek = getDaysInWeek(currentDate);

  const handleMouseDown = (date: Date, slot: { hour: number; minute: number }) => {
    const startDate = setMinutes(setHours(new Date(date), slot.hour), slot.minute);
    setMouseDown(true);
    setDragState({
      startDate,
      endDate: startDate,
      isDragging: true,
    });
  };

  const handleMouseMove = (date: Date, slot: { hour: number; minute: number }) => {
    if (mouseDown && dragState.startDate && !dragState.draggedEventId) {
      const currentDate = setMinutes(setHours(new Date(date), slot.hour), slot.minute);
      setDragState(prev => ({
        ...prev,
        // add half hour to the current date
        endDate: currentDate,
      }));
    }
  };

  const handleMouseUp = () => {
    if (mouseDown && dragState.startDate && dragState.endDate && !dragState.draggedEventId) {
      setShowModal(true);
    }
    setMouseDown(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [mouseDown, dragState]);

  const handleEventDragStart = (event: CalendarEvent) => {
    setDragState({
      startDate: event.start,
      endDate: event.end,
      isDragging: true,
      draggedEventId: event.id,
    });
  };

  const handleDragOver = (e: React.DragEvent, date: Date, slot: { hour: number; minute: number }) => {
    e.preventDefault();
    const targetDate = setMinutes(setHours(new Date(date), slot.hour), slot.minute);
    
    if (dragState.isDragging && dragState.draggedEventId) {
      setDragState(prev => ({
        ...prev,
        endDate: targetDate,
      }));
    }
  };

  const handleDrop = (e: React.DragEvent, date: Date, slot: { hour: number; minute: number }) => {
    e.preventDefault();
    const targetDate = setMinutes(setHours(new Date(date), slot.hour), slot.minute);
    
    if (dragState.draggedEventId && dragState.startDate) {
      const originalEvent = events.find(e => e.id === dragState.draggedEventId);
      if (originalEvent) {
        const duration = originalEvent.end.getTime() - originalEvent.start.getTime();
        onEventUpdate(dragState.draggedEventId, {
          start: targetDate,
          end: new Date(targetDate.getTime() + duration),
        });
      }
    }
    
    setDragState({
      startDate: null,
      endDate: null,
      isDragging: false,
      draggedEventId: undefined,
    });
  };

  return (
    <div className="grid grid-cols-8 gap-1 p-2 calendar-grid">
      <div className="sticky left-0 bg-background">
        <div className="h-6" />
        {TIME_SLOTS.map((slot) => (
          <div
            key={`${slot.hour}:${slot.minute}`}
            className="h-6 text-xs text-muted-foreground pr-2 text-right"
          >
            {slot.minute === 0 && (
              <time dateTime={`${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`}>
                {/* {format(setHours(referenceDate, slot.hour), 'HH:mm')} */}
                {/* 12 hr clock */}
                {format(setHours(referenceDate, slot.hour), 'h a')}
              </time>
            )}
          </div>
        ))}
      </div>
      {currentWeek.map((date) => (
        <div key={date.toISOString()} className="flex flex-col flex-1">
          <div className="text-center text-sm font-medium text-muted-foreground h-6">
            {format(date, "EEE d")}
          </div>
          {TIME_SLOTS.map((slot) => {
            const slotEvents = events.filter(event => 
              isSameDay(event.start, date) && 
              event.start.getHours() === slot.hour && 
              event.start.getMinutes() === slot.minute
            );

            return (
              <div
                key={`${date.toISOString()}-${slot.hour}:${slot.minute}`}
                className={cn(
                  "h-6 border-t relative group",
                  isToday(date) && "bg-accent/50",
                  slot.minute === 0 && "border-t-2",
                  mouseDown && dragState.startDate && "cursor-pointer",
                  dragState.startDate && 
                  dragState.endDate && 
                  isTimeSlotInRange(date, slot, dragState.startDate, dragState.endDate) && 
                  "bg-primary/20"
                )}
                onMouseDown={() => handleMouseDown(date, slot)}
                onMouseMove={() => handleMouseMove(date, slot)}
                onDragOver={(e) => handleDragOver(e, date, slot)}
                onDrop={(e) => handleDrop(e, date, slot)}
              >
                {slotEvents.map(event => (
                  <CalendarEventComponent
                    key={event.id}
                    event={event}
                    onDragStart={handleEventDragStart}
                  />
                ))}
              </div>
            );
          })}
        </div>
      ))}
      <EventModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setDragState({
            startDate: null,
            endDate: null,
            isDragging: false,
          });
        }}
        onSave={onEventAdd}
        startDate={dragState.startDate}
        endDate={new Date(dragState.endDate?.getTime()! + 30 * 60 * 1000)}
      />
    </div>
  );
}

function isTimeSlotInRange(
  date: Date,
  slot: { hour: number; minute: number },
  startDate: Date,
  endDate: Date
): boolean {
  const slotDate = setMinutes(setHours(new Date(date), slot.hour), slot.minute);
  const start = new Date(Math.min(startDate.getTime(), endDate.getTime()));
  const end = new Date(Math.max(startDate.getTime(), endDate.getTime()));
  
  return (
    isSameDay(slotDate, start) &&
    slotDate.getTime() >= start.getTime() &&
    slotDate.getTime() <= end.getTime()
  );
}