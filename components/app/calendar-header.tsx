"use client";

import {
  ChevronLeft,
  ChevronRight,
  Grid3x3,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CalendarViewMode, shiftDate } from "@/lib/calendar-date-utils";
import { formatMonthYear } from "@/lib/calendar-format";

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
}

export function CalendarHeader({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
}: CalendarHeaderProps) {
  const router = useRouter();

  const handlePrevious = () =>
    onDateChange(shiftDate(selectedDate, viewMode, -1));

  const handleNext = () => onDateChange(shiftDate(selectedDate, viewMode, 1));

  const handleToday = () => {
    onDateChange(new Date());
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="h-9 px-4" onClick={handleToday}>
          Today
        </Button>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleNext}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <h1 className="text-xl text-foreground font-mono">
          {formatMonthYear(selectedDate)}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => {
            router.push("/settings");
          }}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Select
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as any)}
        >
          <SelectTrigger className="h-9 w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="agenda">Agenda</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Grid3x3 className="h-5 w-5" />
          <span className="sr-only">Grid</span>
        </Button>
      </div>
    </header>
  );
}
