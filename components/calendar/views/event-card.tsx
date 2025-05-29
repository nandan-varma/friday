"use client"

import { Clock, MapPin, MoreHorizontal } from "lucide-react"
import { format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarEvent } from "./types"

interface EventCardProps {
  event: CalendarEvent
  variant?: 'default' | 'compact' | 'minimal'
  showTime?: boolean
  showLocation?: boolean
  showDescription?: boolean
  onClick?: (event: CalendarEvent) => void
  className?: string
}

export function EventCard({ 
  event, 
  variant = 'default',
  showTime = true,
  showLocation = true,
  showDescription = true,
  onClick,
  className 
}: EventCardProps) {
  const handleClick = () => {
    onClick?.(event)
  }

  const getEventStyles = () => {
    const baseStyles = "rounded-lg border transition-all duration-200 cursor-pointer group"
    
    if (event.source === 'google') {
      return cn(
        baseStyles,
        "bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-sm dark:bg-blue-950/20 dark:border-blue-800 dark:hover:bg-blue-900/30"
      )
    }
    
    return cn(
      baseStyles,
      "bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30 hover:shadow-sm"
    )
  }

  if (variant === 'minimal') {
    return (
      <div
        className={cn(
          "text-xs p-1 rounded truncate cursor-pointer transition-colors",
          event.source === 'google' 
            ? "text-blue-700 hover:bg-blue-200 dark:text-blue-400 dark:hover:bg-blue-900/30" 
            : "bg-primary/10 text-primary hover:bg-primary/20",
          className
        )}
        title={event.title}
        onClick={handleClick}
      >
        {event.title}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(getEventStyles(), "p-2", className)}
        onClick={handleClick}
      >
        <div className="font-medium text-sm truncate group-hover:text-foreground transition-colors">
          {event.title}
        </div>
        {showTime && (
          <div className="text-xs text-muted-foreground mt-1 opacity-80 group-hover:opacity-100 transition-opacity">
            {event.isAllDay
              ? "All day"
              : format(parseISO(event.startTime), "h:mm a")
            }
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(getEventStyles(), "p-3 hover:shadow-md", className)}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate group-hover:text-foreground transition-colors">
            {event.title}
          </div>
          
          {showTime && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">
              <Clock className="h-3 w-3 flex-shrink-0" />
              {event.isAllDay
                ? "All day"
                : `${format(parseISO(event.startTime), "h:mm a")} - ${format(parseISO(event.endTime), "h:mm a")}`
              }
            </div>
          )}
          
          {showLocation && event.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1 group-hover:text-muted-foreground/80 transition-colors">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            // Handle event menu
          }}
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
      
      {showDescription && event.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
          {event.description}
        </p>
      )}
    </div>
  )
}
