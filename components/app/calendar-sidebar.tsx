"use client";

import {
  addDays,
  addMonths,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { formatMonthYear } from "@/lib/calendar-format";
import type { Calendar } from "@/types/calendar";

interface CalendarSidebarProps {
  calendars: Calendar[];
  onToggleCalendar: (calendarId: string) => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WEEKDAY_LETTERS = [
  { id: "sun", label: "S" },
  { id: "mon", label: "M" },
  { id: "tue", label: "T" },
  { id: "wed", label: "W" },
  { id: "thu", label: "T" },
  { id: "fri", label: "F" },
  { id: "sat", label: "S" },
];

export function CalendarSidebar({
  calendars,
  onToggleCalendar,
  selectedDate,
  onDateSelect,
}: CalendarSidebarProps) {
  const gridStart = startOfWeek(startOfMonth(selectedDate));
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const isToday = (date: Date) => isSameDay(date, new Date());
  const isSelected = (date: Date) => isSameDay(date, selectedDate);
  const isCurrentMonth = (date: Date) => isSameMonth(date, selectedDate);

  return (
    <aside className="w-64 border-r border-border bg-sidebar p-4">
      <Button className="mb-6 h-12 w-full justify-start gap-2 pl-4 text-sm font-medium">
        <Plus className="h-5 w-5" />
        Create
      </Button>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between px-2">
          <span className="text-sm font-medium text-sidebar-foreground">
            {formatMonthYear(selectedDate)}
          </span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDateSelect(subMonths(selectedDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDateSelect(addMonths(selectedDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
          {WEEKDAY_LETTERS.map((day) => (
            <div key={day.id} className="py-1">
              {day.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              type="button"
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`relative flex h-8 w-8 items-center justify-center border text-xs transition-colors hover:bg-accent ${
                !isCurrentMonth(day)
                  ? "border-transparent text-muted-foreground/40"
                  : isToday(day)
                    ? "border-foreground bg-foreground text-background"
                    : isSelected(day)
                      ? "border-border bg-accent"
                      : "border-transparent text-sidebar-foreground"
              }`}
            >
              {day.getDate()}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for people"
            className="h-9 pl-9 bg-sidebar-accent border-sidebar-border"
          />
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className="text-sm font-medium text-sidebar-foreground">
            My calendars
          </h3>
        </div>
        <div className="space-y-1">
          {calendars.map((calendar) => (
            <div
              key={calendar.id}
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-sidebar-accent cursor-pointer transition-colors"
            >
              <Checkbox
                checked={calendar.checked}
                onCheckedChange={() => onToggleCalendar(calendar.id)}
              />
              <span className="text-sm text-sidebar-foreground">
                {calendar.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
