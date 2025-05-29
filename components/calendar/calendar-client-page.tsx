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
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <Link href="/events/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-1 border rounded-md p-1 w-full sm:w-auto overflow-x-auto">
          <Button
            variant={currentView === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("day")}
            className="flex-shrink-0"
          >
            Day
          </Button>
          <Button
            variant={currentView === "week" ? "default" : "ghost"}
            size="sm"            onClick={() => setCurrentView("week")}
            className="flex-shrink-0"
          >
            Week
          </Button>
          <Button
            variant={currentView === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("month")}
            className="flex-shrink-0"
          >
            Month
          </Button>
          <Button
            variant={currentView === "agenda" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCurrentView("agenda")}
            className="flex-shrink-0"
          >
            Agenda
          </Button>
        </div>
        
        <Badge variant="secondary" className="sm:ml-auto">
          {events.length} event{events.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="w-full">
        <CalendarView events={events} view={currentView} />
      </div>
    </div>
  )
}
