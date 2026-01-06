"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Calendar as CalendarType } from "@/db/schema/calendar";
import { useState } from "react";

interface CalendarSidebarProps {
  calendars: CalendarType[];
  selectedDate: Date;
  onDateSelect: (date: Date | undefined) => void;
  visibleCalendars: Set<string>;
  onCalendarToggle: (calendarId: string) => void;
  onCreateCalendar?: () => void;
  onCreateEvent?: () => void;
}

export function CalendarSidebar({
  calendars,
  selectedDate,
  onDateSelect,
  visibleCalendars,
  onCalendarToggle,
  onCreateCalendar,
  onCreateEvent,
}: CalendarSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <Button className="w-full" onClick={onCreateEvent}>
          + Create Event
        </Button>
      </SidebarHeader>

      <SidebarContent>
        {/* Mini Calendar */}
        <SidebarGroup>
          <div className="px-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              className="rounded-lg border"
            />
          </div>
        </SidebarGroup>

        <Separator />

        {/* My Calendars */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>My Calendars</span>
            {onCreateCalendar && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onCreateCalendar}
                className="size-5"
              >
                +
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {calendars.map((calendar) => (
                <SidebarMenuItem key={calendar.id}>
                  <SidebarMenuButton
                    className="flex items-center gap-2 px-2"
                    onClick={() => onCalendarToggle(calendar.id)}
                  >
                    <Checkbox
                      checked={visibleCalendars.has(calendar.id)}
                      onCheckedChange={() => onCalendarToggle(calendar.id)}
                      className="pointer-events-none"
                    />
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: calendar.color }}
                    />
                    <span className="flex-1 truncate text-sm">{calendar.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {calendars.length === 0 && (
                <div className="text-muted-foreground px-2 py-4 text-center text-xs">
                  No calendars yet
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="text-muted-foreground px-2 text-xs">
          {calendars.length} calendar{calendars.length !== 1 ? "s" : ""}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
