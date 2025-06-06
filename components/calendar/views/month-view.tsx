"use client"

import { useState } from "react"
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  isToday,
  isSameMonth,
  addMonths,
  subMonths
} from "date-fns"
import { cn } from "@/lib/utils"
import { CalendarViewProps } from "./types"
import { CalendarHeader } from "./calendar-header"
import { EventCard } from "./event-card"
import { EventModal } from "../event-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { type UnifiedEvent } from "@/services/eventService"

export function MonthView({ 
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
  
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const weekDaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setSelectedEvent(null)
    setModalOpen(true)
    onCreateEvent?.(day)
  }

  const handleEventClick = (event: UnifiedEvent) => {
    setSelectedEvent(event)
    setSelectedDate(null)
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

  const handlePrevious = () => {
    onDateChange(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    onDateChange(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }


  return (
    <div className="space-y-4">
      <CalendarHeader
        title={format(currentDate, "MMMM yyyy")}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />
      
      <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {weekDays.map((day, index) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{weekDaysShort[index]}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, i) => {
            const dayEvents = events.filter(event => 
              isSameDay(event.startTime, day)
            )
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isTodayDate = isToday(day)
            
            return (
              <div 
                key={i} 
                className={cn(
                  "min-h-[100px] md:min-h-[140px] p-2 border-r border-b last:border-r-0 relative transition-colors cursor-pointer group",
                  !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                  isTodayDate && "bg-primary/5 ring-1 ring-primary/20",
                  "hover:bg-accent/30"
                )}
                onClick={() => handleDayClick(day)}
              >
                {/* Day number */}
                <div className={cn(
                  "text-sm font-medium mb-2 flex justify-start",
                  isTodayDate && "text-primary font-semibold"
                )}>
                  <span className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors",
                    isTodayDate && "bg-primary text-primary-foreground shadow-sm",
                    !isTodayDate && "group-hover:bg-accent"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
                      {/* Events */}
            <div className="space-y-1 overflow-hidden">
              {dayEvents.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="minimal"
                  onClick={handleEventClick}
                  className="w-full"
                />
              ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1 py-0.5 bg-muted/50 rounded text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>

                {/* Create event hint on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded shadow-sm">                    Click to create
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={selectedEvent}
        defaultDate={selectedDate || undefined}
        onEventSaved={handleEventSaved}
        onEventDeleted={handleEventDeleted}
        mode={selectedEvent ? "edit" : "create"}
      />
    </div>
  )
}

// Skeleton component for loading state
export function MonthViewSkeleton() {
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
      
      <div className="bg-card rounded-lg border overflow-hidden shadow-sm">
        {/* Week day headers */}
        <div className="grid grid-cols-7 border-b bg-muted/30">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-3 text-center border-r last:border-r-0">
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          ))}
        </div>
        
        {/* Calendar days grid */}
        <div className="grid grid-cols-7">
          {Array.from({ length: 42 }).map((_, i) => (
            <div 
              key={i} 
              className="min-h-[100px] md:min-h-[140px] p-2 border-r border-b last:border-r-0"
            >
              <Skeleton className="h-7 w-7 rounded-full mb-2" />
              <div className="space-y-1">
                {Math.random() > 0.7 && <Skeleton className="h-4 w-full" />}
                {Math.random() > 0.8 && <Skeleton className="h-4 w-3/4" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
