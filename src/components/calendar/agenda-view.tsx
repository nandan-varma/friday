"use client"

import { useState } from "react"
import { format, isSameDay, startOfWeek, endOfWeek, addWeeks, subWeeks, isToday, isTomorrow, isYesterday } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Plus, Calendar, MapPin, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { UnifiedEvent } from "@/lib/eventService"

interface AgendaViewProps {
  currentDate: Date
  events: UnifiedEvent[]
  onDateChange: (date: Date) => void
  onEventClick: (event: UnifiedEvent) => void
  onCreateEvent: (date: Date) => void
}

export function AgendaView({ currentDate, events, onDateChange, onEventClick, onCreateEvent }: AgendaViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })

  // Get events for the current week
  const weekEvents = events.filter(event => {
    const eventDate = new Date(event.startTime)
    return eventDate >= weekStart && eventDate <= weekEnd
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  // Group events by date
  const eventsByDate = weekEvents.reduce((acc, event) => {
    const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd')
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, UnifiedEvent[]>)

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? subWeeks(currentDate, 1)
      : addWeeks(currentDate, 1)
    onDateChange(newDate)
  }

  const getRelativeDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    if (isYesterday(date)) return 'Yesterday'
    return format(date, 'EEEE')
  }

  const getDateColor = (date: Date) => {
    if (isToday(date)) return 'text-primary font-bold'
    if (isTomorrow(date)) return 'text-blue-600 font-semibold'
    return 'text-foreground'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={() => onCreateEvent(currentDate)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      {/* Agenda List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agenda ({weekEvents.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(eventsByDate).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No events this week</h3>
              <p className="text-sm mb-4">Your schedule is clear. Add some events to get started!</p>
              <Button onClick={() => onCreateEvent(currentDate)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Event
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-6">
                {Object.entries(eventsByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([dateKey, dayEvents]) => {
                    const date = new Date(dateKey + 'T00:00:00')
                    const relativeLabel = getRelativeDateLabel(date)
                    const isSelected = selectedDate && isSameDay(selectedDate, date)

                    return (
                      <div key={dateKey} className="space-y-3">
                        {/* Date Header */}
                        <div
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                            isSelected && "bg-muted"
                          )}
                          onClick={() => setSelectedDate(date)}
                        >
                          <div className="flex-1">
                            <h3 className={cn("text-lg font-semibold", getDateColor(date))}>
                              {relativeLabel}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {format(date, 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>

                        {/* Events for this date */}
                        <div className="space-y-2 ml-6">
                          {dayEvents.map(event => (
                            <Card
                              key={event.id}
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => onEventClick(event)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-base">{event.title}</h4>
                                      <Badge
                                        variant={event.origin === 'google' ? 'default' : 'secondary'}
                                        className="text-xs"
                                      >
                                        {event.origin}
                                      </Badge>
                                      {event.isAllDay && (
                                        <Badge variant="outline" className="text-xs">
                                          All Day
                                        </Badge>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        {event.isAllDay
                                          ? 'All day'
                                          : `${format(new Date(event.startTime), 'h:mm a')} - ${format(new Date(event.endTime), 'h:mm a')}`
                                        }
                                      </div>

                                      {event.location && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="w-4 h-4" />
                                          <span className="truncate max-w-[200px]">{event.location}</span>
                                        </div>
                                      )}

                                      {event.attendees && event.attendees.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                                        </div>
                                      )}
                                    </div>

                                    {event.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-2">
                                        {event.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Events</p>
                <p className="text-2xl font-bold text-primary">{weekEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500" />
              <div>
                <p className="text-sm font-medium">Local Events</p>
                <p className="text-2xl font-bold text-green-600">
                  {weekEvents.filter(e => e.origin === 'local').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500" />
              <div>
                <p className="text-sm font-medium">Google Events</p>
                <p className="text-2xl font-bold text-blue-600">
                  {weekEvents.filter(e => e.origin === 'google').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">All Day</p>
                <p className="text-2xl font-bold text-orange-600">
                  {weekEvents.filter(e => e.isAllDay).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}