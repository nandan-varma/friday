"use client"

import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { Calendar } from "@/types/calendar"

interface CalendarSidebarProps {
  calendars: Calendar[]
  onToggleCalendar: (calendarId: string) => void
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export function CalendarSidebar({ calendars, onToggleCalendar, selectedDate, onDateSelect }: CalendarSidebarProps) {
  const currentMonth = selectedDate.getMonth()
  const currentYear = selectedDate.getFullYear()

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)
  const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1)

  const days = []
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
    })
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
    })
  }
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
  }

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    )
  }

  return (
    <aside className="w-64 border-r border-border bg-sidebar p-4">
      <Button className="mb-6 h-12 w-full justify-start gap-2 rounded-full pl-4 text-sm font-medium shadow-sm">
        <Plus className="h-5 w-5" />
        Create
      </Button>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-sm font-medium text-sidebar-foreground">
            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() - 1)
                onDateSelect(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                const newDate = new Date(selectedDate)
                newDate.setMonth(newDate.getMonth() + 1)
                onDateSelect(newDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div key={i} className="py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((dayInfo, i) => (
            <button
              key={i}
              onClick={() => {
                if (dayInfo.isCurrentMonth) {
                  const newDate = new Date(currentYear, currentMonth, dayInfo.day)
                  onDateSelect(newDate)
                }
              }}
              className={`relative flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors hover:bg-accent ${
                !dayInfo.isCurrentMonth
                  ? "text-muted-foreground/40"
                  : isToday(dayInfo.day)
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : isSelected(dayInfo.day)
                      ? "bg-accent"
                      : "text-sidebar-foreground"
              }`}
            >
              {dayInfo.day}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search for people" className="h-9 pl-9 bg-sidebar-accent border-sidebar-border" />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-sm font-medium text-sidebar-foreground">My calendars</h3>
        </div>
        <div className="space-y-1">
          {calendars.map((calendar) => (
            <label
              key={calendar.id}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent cursor-pointer transition-colors"
            >
              <Checkbox
                checked={calendar.checked}
                onCheckedChange={() => onToggleCalendar(calendar.id)}
                className={`data-[state=checked]:bg-${calendar.color}-600 data-[state=checked]:border-${calendar.color}-600`}
              />
              <span className="text-sm text-sidebar-foreground">{calendar.name}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  )
}
