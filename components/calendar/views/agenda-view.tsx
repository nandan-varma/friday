"use client"

import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { CalendarViewProps } from "./types"
import { EventCard } from "./event-card"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export function AgendaView({ 
  events, 
  currentDate, 
  onDateChange, 
  onEventClick,
  timezone 
}: CalendarViewProps) {
  const handleToday = () => {
    onDateChange(new Date())
  }

  // Group events by date
  const groupedEvents = events
    .filter(event => isAfter(event.startTime, new Date()) || 
                    format(event.startTime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 50) // Limit to 50 upcoming events
    .reduce((groups, event) => {
      const date = format(event.startTime, 'yyyy-MM-dd')
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
      return groups
    }, {} as Record<string, typeof events>)

  const groupedEventEntries = Object.entries(groupedEvents)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg md:text-xl lg:text-2xl font-semibold">Upcoming Events</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {groupedEventEntries.length > 0 
              ? `${events.filter(e => isAfter(e.startTime, new Date())).length} upcoming events`
              : "No upcoming events"
            }
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          Today
        </Button>
      </div>

      {/* Events */}
      <div className="space-y-6">
        {groupedEventEntries.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-6 pr-4">
              {groupedEventEntries.map(([dateStr, dayEvents]) => {
                const date = new Date(dateStr)
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                const isTomorrow = format(date, 'yyyy-MM-dd') === format(addDays(new Date(), 1), 'yyyy-MM-dd')
                
                return (
                  <div key={dateStr} className="space-y-3">
                    {/* Date header */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 text-center min-w-[80px]">
                        <div className={`text-sm ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                          {format(date, "MMM")}
                        </div>
                        <div className={`text-2xl font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                          {format(date, "d")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(date, "EEE")}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {isToday 
                            ? "Today" 
                            : isTomorrow 
                              ? "Tomorrow" 
                              : format(date, "EEEE, MMMM d")
                          }
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={isToday ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}
                          </Badge>
                          {dayEvents.some(e => e.isAllDay) && (
                            <Badge className="text-xs">
                              All Day
                            </Badge>
                          )}
                          {dayEvents.some(e => e.origin === 'google') && (
                            <Badge variant="outline" className="text-xs">
                              Google
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Events for this date */}
                    <div className="ml-[92px] space-y-3">
                      {dayEvents.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={onEventClick}
                          className="shadow-sm hover:shadow-md transition-shadow"
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        ) : (
          <Card className="p-12 text-center">
            <div className="text-muted-foreground space-y-4">
              <div className="text-6xl mb-4">📅</div>
              <div>
                <h3 className="font-semibold text-lg mb-2">No upcoming events</h3>
                <p className="text-sm">
                  Your calendar is clear. Time to plan something exciting!
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => onDateChange(new Date())}
                className="mt-4"
              >
                Create your first event
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

// Skeleton component for loading state
export function AgendaViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Events skeleton */}
      <div className="space-y-6">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-6 pr-4">
            {Array.from({ length: 5 }).map((_, dateIndex) => (
              <div key={dateIndex} className="space-y-3">
                {/* Date header skeleton */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-center min-w-[80px]">
                    <Skeleton className="h-4 w-8 mx-auto mb-1" />
                    <Skeleton className="h-8 w-8 mx-auto mb-1" />
                    <Skeleton className="h-3 w-6 mx-auto" />
                  </div>
                  
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </div>
                </div>
                
                {/* Events for this date skeleton */}
                <div className="ml-[92px] space-y-3">
                  {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, eventIndex) => (
                    <Card key={eventIndex} className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        {Math.random() > 0.5 && <Skeleton className="h-4 w-24" />}
                      </div>
                      {Math.random() > 0.6 && (
                        <Skeleton className="h-8 w-full mt-2" />
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
