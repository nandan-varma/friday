"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";

interface CalendarToolbarProps {
  currentDate: Date;
  view: "day" | "week" | "month";
  onDateChange: (date: Date) => void;
  onViewChange: (view: "day" | "week" | "month") => void;
  onCreateEvent: () => void;
  onToday: () => void;
}

export function CalendarToolbar({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onCreateEvent,
  onToday,
}: CalendarToolbarProps) {
  const handlePrevious = () => {
    switch (view) {
      case "day":
        onDateChange(subDays(currentDate, 1));
        break;
      case "week":
        onDateChange(subWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (view) {
      case "day":
        onDateChange(addDays(currentDate, 1));
        break;
      case "week":
        onDateChange(addWeeks(currentDate, 1));
        break;
      case "month":
        onDateChange(addMonths(currentDate, 1));
        break;
    }
  };

  const getDisplayText = () => {
    switch (view) {
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      case "week":
        return format(currentDate, "MMMM yyyy");
      case "month":
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Button onClick={onToday} variant="outline" size="sm">
          Today
        </Button>
        <ButtonGroup>
          <Button onClick={handlePrevious} variant="outline" size="icon-sm">
            ←
          </Button>
          <Button onClick={handleNext} variant="outline" size="icon-sm">
            →
          </Button>
        </ButtonGroup>
        <h2 className="text-lg font-semibold">{getDisplayText()}</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <Input
          type="search"
          placeholder="Search events..."
          className="w-full sm:w-[200px]"
        />

        {/* View Switcher */}
        <Tabs value={view} onValueChange={(v) => onViewChange(v as any)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Create Event Button */}
        <Button onClick={onCreateEvent} size="sm">
          + Create
        </Button>
      </div>
    </div>
  );
}
