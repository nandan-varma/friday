"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CalendarHeaderProps {
  title: string
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  showTodayButton?: boolean
  className?: string
}

export function CalendarHeader({ 
  title, 
  onPrevious, 
  onNext, 
  onToday, 
  showTodayButton = true,
  className 
}: CalendarHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-2 mb-6", className)}>
      <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-foreground truncate">
        {title}
      </h2>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onPrevious}
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {showTodayButton && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToday}
            className="h-8 px-3 text-xs hover:bg-accent transition-colors"
          >
            Today
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNext}
          className="h-8 w-8 p-0 hover:bg-accent transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
