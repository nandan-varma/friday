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
  startOfMonth,
  endOfMonth,
  getDay,
  isToday,
  isSameMonth,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight, Clock, MapPin, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  description?: string | null
  location?: string | null
  source?: 'local' | 'google'
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
    } else if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, -1))
    }
  }

  const handleNext = () => {
    if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1))
    } else if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1))
    } else {
      setCurrentDate(addDays(currentDate, 1))
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const renderHeader = (title: string) => (
    <div className="flex items-center justify-between gap-2 mb-6">
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground truncate">
        {title}
      </h2>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevious}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToday}
          className="h-8 px-3 text-xs"
        >
          Today
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNext}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  // Month View
  if (view === "month") {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
    
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    return (
      <div className="space-y-4">
        {renderHeader(format(currentDate, "MMMM yyyy"))}
        
        {/* Month Grid */}
        <div className="bg-card rounded-lg border overflow-hidden">
          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayEvents = events.filter(event => 
                isSameDay(parseISO(event.startTime), day)
              )
              const isCurrentMonth = isSameMonth(day, currentDate)
              
              return (
                <div 
                  key={i} 
                  className={cn(
                    "min-h-[80px] md:min-h-[120px] p-1 border-r border-b relative",
                    !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "text-primary font-semibold"
                  )}>
                    <span className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer transition-colors",
                          event.source === 'google' 
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                            : "bg-primary/10 text-primary hover:bg-primary/20"
                        )}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Day View
  if (view === "day") {
    const dayEvents = events.filter(event => 
      isSameDay(parseISO(event.startTime), currentDate)
    )

    return (
      <div className="space-y-4">
        {renderHeader(format(currentDate, "EEEE, MMMM d, yyyy"))}

        <div className="space-y-4">
          {/* All-day events */}
          {dayEvents.filter(event => event.isAllDay).length > 0 && (
            <Card className="p-4">
              <h3 className="font-medium mb-3 text-sm text-muted-foreground">All Day</h3>
              <div className="space-y-2">
                {dayEvents.filter(event => event.isAllDay).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      event.source === 'google'
                        ? "bg-blue-50 border-blue-200"
                        : "bg-primary/10 border-primary/20"
                    )}
                  >
                    <div className="font-medium">{event.title}</div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Time-based events */}
          <Card className="overflow-hidden">
            <div className="divide-y">
              {Array.from({ length: 24 }).map((_, hour) => {
                const hourEvents = dayEvents.filter((event) => {
                  const startHour = new Date(parseISO(event.startTime)).getHours()
                  return !event.isAllDay && startHour === hour
                })

                return (
                  <div key={hour} className="flex min-h-[60px]">
                    <div className="w-16 md:w-20 p-3 text-right text-sm text-muted-foreground bg-muted/30 flex-shrink-0">
                      {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                    </div>
                    <div className="flex-1 p-3 space-y-2">
                      {hourEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            event.source === 'google'
                              ? "bg-blue-50 border-blue-200"
                              : "bg-primary/10 border-primary/20"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(event.startTime), "h:mm a")} - {format(parseISO(event.endTime), "h:mm a")}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mt-2 overflow-hidden text-ellipsis max-h-10">
                              {event.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Week View
  if (view === "week") {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="space-y-4">
        {renderHeader(`${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`)}

        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week header */}
            <div className="grid grid-cols-8 border-b">
              <div className="w-16 md:w-20"></div>
              {days.map((day, i) => (
                <div key={i} className="p-3 text-center border-r">
                  <div className="text-sm text-muted-foreground">
                    {format(day, "EEE")}
                  </div>
                  <div className={cn(
                    "text-lg font-medium",
                    isToday(day) && "text-primary"
                  )}>
                    <span className={cn(
                      "inline-flex items-center justify-center w-8 h-8 rounded-full",
                      isToday(day) && "bg-primary text-primary-foreground"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="relative">
              {Array.from({ length: 24 }).map((_, hour) => (
                <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                  <div className="w-16 md:w-20 p-2 text-right text-sm text-muted-foreground bg-muted/30">
                    {format(new Date().setHours(hour, 0, 0, 0), "h a")}
                  </div>
                  {days.map((day, dayIndex) => {
                    const dayEvents = events.filter((event) => {
                      const startHour = new Date(parseISO(event.startTime)).getHours()
                      return isSameDay(parseISO(event.startTime), day) && 
                             !event.isAllDay && 
                             startHour === hour
                    })

                    return (
                      <div key={dayIndex} className="border-r p-1 space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-xs p-2 rounded cursor-pointer transition-colors",
                              event.source === 'google'
                                ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            )}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-80">
                              {format(parseISO(event.startTime), "h:mm a")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Agenda View
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">Upcoming Events</h2>
        <Button variant="outline" size="sm" onClick={handleToday}>
          Today
        </Button>
      </div>

      <div className="space-y-4">
        {events.length > 0 ? (
          events
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 20)
            .map((event) => (
              <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 text-center min-w-[60px]">
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(event.startTime), "MMM")}
                    </div>
                    <div className="text-xl font-semibold">
                      {format(parseISO(event.startTime), "d")}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(parseISO(event.startTime), "EEE")}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-medium text-lg leading-tight">{event.title}</h3>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.isAllDay
                          ? "All day"
                          : `${format(parseISO(event.startTime), "h:mm a")} - ${format(parseISO(event.endTime), "h:mm a")}`
                        }
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    
                    {event.description && (                    <p className="text-sm text-muted-foreground mt-2 overflow-hidden text-ellipsis max-h-10">
                      {event.description}
                    </p>
                    )}
                  </div>
                </div>
              </Card>
            ))
        ) : (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="font-medium mb-2">No events scheduled</h3>
              <p className="text-sm">Your calendar is clear. Time to plan something exciting!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
