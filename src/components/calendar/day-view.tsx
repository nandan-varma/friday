"use client"

import { useState } from "react"
import { format, isSameDay, addDays, subDays, setHours, setMinutes } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { UnifiedEvent } from "@/lib/eventService"

interface DayViewProps {
  currentDate: Date
  events: UnifiedEvent[]
  onDateChange: (date: Date) => void
  onEventClick: (event: UnifiedEvent) => void
  onCreateEvent: (date: Date, time?: Date) => void
}

export function DayView({ currentDate, events, onDateChange, onEventClick, onCreateEvent }: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const dayEvents = events.filter(event =>
    isSameDay(new Date(event.startTime), currentDate)
  ).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? subDays(currentDate, 1)
      : addDays(currentDate, 1)
    onDateChange(newDate)
  }

  const getEventsForHour = (hour: number) => {
    return dayEvents.filter(event => {
      const eventStart = new Date(event.startTime)
      return eventStart.getHours() === hour
    })
  }

  const getEventStyle = (event: UnifiedEvent) => {
    const eventStart = new Date(event.startTime)
    const eventEnd = new Date(event.endTime)
    const duration = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60) // minutes

    const startMinutes = eventStart.getMinutes()
    const top = (startMinutes / 60) * 64 // 64px per hour
    const height = Math.max((duration / 60) * 64, 32) // Minimum 32px height

    return {
      top: `${top}px`,
      height: `${height}px`
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay('prev')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDay('next')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button onClick={() => onCreateEvent(currentDate)}>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline View */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="relative">
                  {hours.map(hour => {
                    const hourEvents = getEventsForHour(hour)

                    return (
                      <div key={hour} className="flex border-b min-h-[64px]">
                        {/* Time label */}
                        <div className="w-20 p-2 text-right">
                          <span className="text-sm text-muted-foreground">
                            {format(setHours(new Date(), hour), 'h:mm a')}
                          </span>
                        </div>

                        {/* Time slot */}
                        <div
                          className="flex-1 relative cursor-pointer hover:bg-muted/30 border-l"
                          onClick={() => onCreateEvent(currentDate, setHours(setMinutes(currentDate, 0), hour))}
                        >
                          {/* Hour divider */}
                          <div className="absolute top-0 left-0 right-0 h-px bg-border" />

                          {/* Events */}
                          {hourEvents.map((event, index) => {
                            const style = getEventStyle(event)

                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  "absolute left-2 right-2 rounded-lg p-2 cursor-pointer hover:opacity-80 border-l-4 overflow-hidden",
                                  event.origin === 'google' ? "bg-blue-50 border-blue-500 text-blue-900" : "bg-green-50 border-green-500 text-green-900"
                                )}
                                style={style}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEventClick(event)
                                }}
                              >
                                <div className="font-medium text-sm truncate">{event.title}</div>
                                <div className="text-xs opacity-75">
                                  {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                                </div>
                                {event.location && (
                                  <div className="text-xs opacity-75 flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate">{event.location}</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Events ({dayEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No events today</p>
                  <p className="text-sm">Your day is free! Add an event to get started.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => onCreateEvent(currentDate)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => onEventClick(event)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm leading-tight">{event.title}</h4>
                          <Badge
                            variant={event.origin === 'google' ? 'default' : 'secondary'}
                            className="text-xs ml-2"
                          >
                            {event.origin}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                          </div>

                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}

                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}

                        {event.isAllDay && (
                          <Badge variant="outline" className="text-xs mt-2">
                            All Day
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}