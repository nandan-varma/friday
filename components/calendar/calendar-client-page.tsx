"use client"

import { useState } from "react"
import { CalendarView } from "./calendar-view"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import Link from "next/link"

type Event = {
  id: string
  title: string
  startTime: string
  endTime: string
  isAllDay: boolean
  description: string | null
  location: string | null
}

type CalendarClientPageProps = {
  events: Event[]
}

export function CalendarClientPage({ events }: CalendarClientPageProps) {
  const [currentView, setCurrentView] = useState<"day" | "week" | "month" | "agenda">("week")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Link href="/events/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={currentView === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("day")}
          >
            Day
          </Button>
          <Button
            variant={currentView === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("week")}
          >
            Week
          </Button>
          <Button
            variant={currentView === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("month")}
          >
            Month
          </Button>
          <Button
            variant={currentView === "agenda" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("agenda")}
          >
            Agenda
          </Button>
        </div>
        
        <Badge variant="secondary" className="ml-auto">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <CalendarView events={events} view={currentView} />
    </div>
  )
}
