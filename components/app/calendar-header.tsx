"use client"

import { ChevronLeft, ChevronRight, Menu, Search, Settings, Grid3x3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface CalendarHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  viewMode: "day" | "week" | "month" | "agenda"
  onViewModeChange: (mode: "day" | "week" | "month" | "agenda") => void
}

export function CalendarHeader({ selectedDate, onDateChange, viewMode, onViewModeChange }: CalendarHeaderProps) {

  const router = useRouter();

  const handlePrevious = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1)
    }
    onDateChange(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(selectedDate)
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1)
    }
    onDateChange(newDate)
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const formatHeaderDate = () => {
    return selectedDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" className="h-9 rounded-full px-4 bg-transparent" onClick={handleToday}>
          Today
        </Button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next</span>
          </Button>
        </div>

        <h1 className="text-xl text-foreground">{formatHeaderDate()}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10" onClick={()=>{
          router.push("/settings")
        }}>
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
        <Select value={viewMode} onValueChange={(v) => onViewModeChange(v as any)}>
          <SelectTrigger className="h-9 w-[110px] rounded-full">
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
  )
}
