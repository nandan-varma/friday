"use client"

import { useState } from "react"
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday,
  addWeeks,
  subWeeks
} from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarViewProps } from "./types"
import { CalendarHeader } from "./calendar-header"
import { EventCard } from "./event-card"
import { EventModal } from "../event-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { type UnifiedEvent } from "@/services/eventService"

export function WeekView({ 
  events, 
  currentDate, 
  onDateChange, 
  onEventClick,
  onCreateEvent,
  timezone 
}: CalendarViewProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<UnifiedEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedHour, setSelectedHour] = useState<number | undefined>(undefined)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handlePrevious = () => {
    onDateChange(subWeeks(currentDate, 1))
  }

  const handleNext = () => {
    onDateChange(addWeeks(currentDate, 1))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const handleTimeSlotClick = (day: Date, hour: number) => {
    setSelectedDate(day)
    setSelectedHour(hour)
    setSelectedEvent(null)
    setModalOpen(true)
    onCreateEvent?.(day, hour)
  }

  const handleEventClick = (event: UnifiedEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
    setSelectedHour(undefined)
    setModalOpen(true)
    onEventClick?.(event)
  }
  const handleEventSaved = (event: UnifiedEvent) => {
    // Event saved successfully, views will be updated via revalidation
    console.log("Event saved:", event)
  }

  const handleEventDeleted = (eventId: string) => {
    // Event deleted successfully, views will be updated via revalidation  
    console.log("Event deleted:", eventId)
  }

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="space-y-4">
      <CalendarHeader
        title={`${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className="overflow-x-auto bg-card rounded-lg border shadow-sm">
        <div className="min-w-[800px]">
          {/* All-day events section */}
          {events.some(event => event.isAllDay) && (
            <div className="border-b bg-muted/20">
              <div className="grid grid-cols-8 min-h-[60px]">
                <div className="w-20 p-3 text-center text-sm font-medium text-muted-foreground bg-muted/30 border-r">
                  All Day
                </div>
                {days.map((day, i) => {
                  const allDayEvents = events.filter(event => 
                    event.isAllDay && isSameDay(event.startTime, day)
                  )
                  
                  return (
                    <div key={i} className="border-r last:border-r-0 p-2 space-y-1">
                      {allDayEvents.map((event) => (                        <EventCard
                          key={event.id}
                          event={event}
                          variant="compact"
                          showTime={false}
                          onClick={handleEventClick}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Week header with days */}
          <div className="grid grid-cols-8 border-b bg-muted/20 sticky top-0 z-10">
            <div className="w-20 p-3 bg-muted/30 border-r"></div>
            {days.map((day, i) => (
              <div key={i} className="p-3 text-center border-r last:border-r-0">
                <div className="text-sm text-muted-foreground font-medium">
                  {format(day, "EEE")}
                </div>
                <div className={cn(
                  "text-lg font-semibold mt-1",
                  isToday(day) && "text-primary"
                )}>
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                    isToday(day) && "bg-primary text-primary-foreground shadow-sm"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative">
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px] group hover:bg-accent/20 transition-colors">
                <div className="w-20 p-2 text-right text-sm text-muted-foreground bg-muted/30 border-r flex items-start justify-end">
                  <span className="mt-1">
                    {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                  </span>
                </div>
                {days.map((day, dayIndex) => {
                  const hourEvents = events.filter((event) => {
                    const startHour = new Date(event.startTime).getHours()
                    return isSameDay(event.startTime, day) && 
                           !event.isAllDay && 
                           startHour === hour
                  })

                  return (
                    <div 
                      key={dayIndex} 
                      className="border-r last:border-r-0 p-1 space-y-1 relative cursor-pointer group/cell"
                      onClick={() => handleTimeSlotClick(day, hour)}
                    >
                      {hourEvents.map((event) => (                        <EventCard
                          key={event.id}
                          event={event}
                          variant="compact"
                          showLocation={false}
                          onClick={handleEventClick}
                        />
                      ))}
                      
                      {/* Create event hint */}
                      {hourEvents.length === 0 && (
                        <div className="absolute inset-0 opacity-0 group-hover/cell:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded shadow-sm">
                            Click to create
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}              </div>
            ))}
          </div>
        </div>
      </div>

      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        timezone={timezone}
        onEventSaved={handleEventSaved}
        onEventDeleted={handleEventDeleted}
      />
    </div>
  )
}

// Skeleton component for loading state
export function WeekViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <div className="overflow-x-auto bg-card rounded-lg border shadow-sm">
        <div className="min-w-[800px]">
          {/* Week header with days */}
          <div className="grid grid-cols-8 border-b bg-muted/20">
            <div className="w-20 p-3 bg-muted/30 border-r"></div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="p-3 text-center border-r last:border-r-0">
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-8 w-8 rounded-full mx-auto" />
              </div>
            ))}
          </div>

          {/* Time grid skeleton */}
          <div className="relative">
            {Array.from({ length: 12 }).map((_, hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="w-20 p-2 text-right bg-muted/30 border-r">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </div>
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div key={dayIndex} className="border-r last:border-r-0 p-1">
                    {Math.random() > 0.8 && (
                      <Skeleton className="h-12 w-full rounded" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
