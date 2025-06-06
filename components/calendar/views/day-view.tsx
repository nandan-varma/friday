"use client"

import { useState } from "react"
import { 
  format, 
  isSameDay,
  parseISO,
  addDays,
  subDays
} from "date-fns"
import { CalendarViewProps } from "./types"
import { CalendarHeader } from "./calendar-header"
import { EventCard } from "./event-card"
import { EventModal } from "../event-modal"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { type UnifiedEvent } from "@/services/eventService"

export function DayView({ 
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

  const dayEvents = events.filter(event => 
    isSameDay(event.startTime, currentDate)
  )
  
  const allDayEvents = dayEvents.filter(event => event.isAllDay)
  const timedEvents = dayEvents.filter(event => !event.isAllDay)

  const handlePrevious = () => {
    onDateChange(subDays(currentDate, 1))
  }

  const handleNext = () => {
    onDateChange(addDays(currentDate, 1))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }
  const handleTimeSlotClick = (hour: number) => {
    setSelectedDate(currentDate)
    setSelectedHour(hour)
    setSelectedEvent(null)
    setModalOpen(true)
    onCreateEvent?.(currentDate, hour)
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
    <div className="space-y-6">
      <CalendarHeader
        title={format(currentDate, "EEEE, MMMM d, yyyy")}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <div className="space-y-4">
        {/* Summary */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">
                {format(currentDate, "EEEE")}
              </h3>
              <p className="text-muted-foreground">
                {dayEvents.length === 0 
                  ? "No events scheduled" 
                  : `${dayEvents.length} event${dayEvents.length === 1 ? '' : 's'} scheduled`
                }
              </p>
            </div>
            <div className="flex gap-2">
              {allDayEvents.length > 0 && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {allDayEvents.length} All Day
                </Badge>
              )}
              {timedEvents.length > 0 && (
                <Badge variant="secondary">
                  {timedEvents.length} Timed
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <Card className="p-4">
            <h3 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wide">
              All Day Events
            </h3>
            <div className="space-y-3">
              {allDayEvents.map((event) => (                <EventCard
                  key={event.id}
                  event={event}
                  showTime={false}
                  onClick={handleEventClick}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Time-based events */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/20 border-b">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Schedule
            </h3>
          </div>
          
          <div className="divide-y">
            {hours.map((hour) => {
              const hourEvents = timedEvents.filter((event) => {
                const startHour = new Date(event.startTime).getHours()
                return startHour === hour
              })

              return (
                <div key={hour} className="flex min-h-[70px] group hover:bg-accent/30 transition-colors">
                  <div className="w-20 md:w-24 p-4 text-right text-sm text-muted-foreground bg-muted/30 flex-shrink-0 border-r">
                    <div className="sticky top-4">
                      {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                    </div>
                  </div>
                  
                  <div 
                    className="flex-1 p-4 space-y-3 cursor-pointer relative"
                    onClick={() => handleTimeSlotClick(hour)}
                  >
                    {hourEvents.length > 0 ? (
                      hourEvents.map((event) => (                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={handleEventClick}
                          className="shadow-sm"
                        />
                      ))
                    ) : (
                      <div className="min-h-[40px] flex items-center">
                        <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-sm text-muted-foreground text-center py-4 border-2 border-dashed border-muted-foreground/20 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors">
                            Click to create an event at {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )            })}
          </div>
        </Card>
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
export function DayViewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-1">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Summary skeleton */}
        <Card className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        </Card>

        {/* Time-based events skeleton */}
        <Card className="overflow-hidden">
          <div className="p-4 bg-muted/20 border-b">
            <Skeleton className="h-4 w-20" />
          </div>
          
          <div className="divide-y">
            {Array.from({ length: 12 }).map((_, hour) => (
              <div key={hour} className="flex min-h-[70px]">
                <div className="w-20 md:w-24 p-4 bg-muted/30 border-r">
                  <Skeleton className="h-4 w-8 ml-auto" />
                </div>
                <div className="flex-1 p-4">
                  {Math.random() > 0.7 && (
                    <Skeleton className="h-16 w-full rounded-lg" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
