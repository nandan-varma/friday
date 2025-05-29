"use client"

import { useState } from "react"
import { CalendarView } from "./calendar-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Plus, Calendar, List, Grid3X3, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  description: string | null
  location: string | null
  source?: 'local' | 'google' // Add source field
}

type CalendarClientPageProps = {
  events: Event[]
}

export function CalendarClientPage({ events }: CalendarClientPageProps) {
  const [currentView, setCurrentView] = useState<"day" | "week" | "month" | "agenda">("week")
  
  const viewOptions = [
    { value: "day", label: "Day", icon: Calendar },
    { value: "week", label: "Week", icon: LayoutGrid },
    { value: "month", label: "Month", icon: Grid3X3 },
    { value: "agenda", label: "Agenda", icon: List },
  ] as const

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground">Manage your schedule and events</p>
          </div>
        </div>
        
        <Link href="/events/new">
          <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* View Selector */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-full lg:w-auto">
            {viewOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={currentView === value ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(value)}
                className={cn(
                  "flex-1 lg:flex-none gap-2 transition-all",
                  currentView === value && "shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.charAt(0)}</span>
              </Button>
            ))}
          </div>
            {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {events.length} event{events.length !== 1 ? 's' : ''}
              </Badge>
              {events.filter(e => e.source === 'google').length > 0 && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {events.filter(e => e.source === 'google').length} Google
                </Badge>
              )}
              {events.filter(e => e.source === 'local').length > 0 && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {events.filter(e => e.source === 'local').length} Local
                </Badge>
              )}
              {events.filter(e => e.isAllDay).length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {events.filter(e => e.isAllDay).length} all-day
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Calendar View */}
      <div className="bg-background">
        <CalendarView events={events} view={currentView} />
      </div>
    </div>
  )
}
