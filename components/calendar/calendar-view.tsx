"use client"

import { useState } from "react"
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isSameDay,
  parseISO,
  addWeeks,
  subWeeks,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  description?: string | null
  location?: string | null
}

type CalendarViewProps = {
  events: Event[]
  view: "day" | "week" | "month" | "agenda"
}

export function CalendarView({ events, view }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const handlePrevious = () => {
    if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const handleNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const renderHeader = (title: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[60px]">
      <h2 className="text-xl sm:text-2xl font-bold break-words flex-1 min-w-0">{title}</h2>
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" onClick={handlePrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (view === "day") {
    return (
      <div className="w-full max-w-full space-y-4">
        {renderHeader(format(currentDate, "EEEE, MMMM d, yyyy"))}

        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-1 gap-2">
            {Array.from({ length: 24 }).map((_, hour) => {
              const hourEvents = events.filter((event) => {
                const startHour = new Date(parseISO(event.startTime)).getHours()
                return isSameDay(parseISO(event.startTime), currentDate) && startHour === hour
              })

              return (
                <div key={hour} className="flex">
                  <div className="w-16 sm:w-20 text-right pr-2 sm:pr-4 text-muted-foreground text-xs sm:text-sm flex-shrink-0">
                    {hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 min-h-[50px] sm:min-h-[60px] border-t">
                    {hourEvents.map((event) => (
                      <Card key={event.id} className="p-2 mb-1 bg-primary/10">
                        <div className="font-medium text-sm truncate">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(event.startTime), "h:mm a")} - {format(parseISO(event.endTime), "h:mm a")}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (view === "week") {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="w-full max-w-full space-y-4">
        {renderHeader(`${format(weekStart, "MMMM d")} - ${format(weekEnd, "MMMM d, yyyy")}`)}

        <div className="w-full overflow-x-auto">
          <div className="min-w-[700px] grid grid-cols-7 gap-2 sm:gap-4">
            {days.map((day, i) => (
              <div key={i} className="space-y-2 min-w-0">
                <div
                  className={cn(
                    "text-center p-2 rounded-md",
                    isSameDay(day, new Date()) && "bg-primary text-primary-foreground",
                  )}
                >
                  <div className="font-medium text-xs sm:text-sm">{format(day, "EEE")}</div>
                  <div className="text-lg sm:text-2xl">{format(day, "d")}</div>
                </div>

                <div className="space-y-1 min-h-[200px]">
                  {events
                    .filter((event) => isSameDay(parseISO(event.startTime), day))
                    .map((event) => (
                      <Card key={event.id} className="p-2 text-sm">
                        <div className="font-medium truncate text-xs sm:text-sm">{event.title}</div>
                        {!event.isAllDay && (
                          <div className="text-xs text-muted-foreground">
                            {format(parseISO(event.startTime), "h:mm a")}
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Default to agenda view
  return (
    <div className="w-full max-w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 min-h-[60px]">
        <h2 className="text-xl sm:text-2xl font-bold flex-1 min-w-0">Upcoming Events</h2>
        <Button variant="outline" size="sm" onClick={handleToday} className="w-full sm:w-auto flex-shrink-0">
          Today
        </Button>
      </div>

      <div className="w-full space-y-4 min-h-[400px]">
        {events.length > 0 ? (
          events
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((event) => (
              <Card key={event.id} className="p-4 w-full">
                <div className="font-medium text-base sm:text-lg break-words">{event.title}</div>
                <div className="text-muted-foreground text-sm">{format(parseISO(event.startTime), "EEEE, MMMM d, yyyy")}</div>
                <div className="text-muted-foreground text-sm">
                  {event.isAllDay
                    ? "All day"
                    : `${format(parseISO(event.startTime), "h:mm a")} - ${format(parseISO(event.endTime), "h:mm a")}`}
                </div>
                {event.location && (
                  <div className="text-muted-foreground text-sm mt-1">📍 {event.location}</div>
                )}
                {event.description && (
                  <div className="text-muted-foreground text-sm mt-2 break-words">{event.description}</div>
                )}
              </Card>
            ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">No events scheduled</div>
        )}
      </div>
    </div>
  )
}
