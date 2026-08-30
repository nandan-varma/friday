"use client"

import { useState, useEffect } from "react"
import { endOfDay, format, parse, startOfDay } from "date-fns"
import type { CalendarEvent, Calendar } from "@/types/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RecurringScopeDialog, type RecurringEditScope } from "@/components/app/recurring-scope-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Repeat, Trash2 } from "lucide-react"
import { getDeviceTimeZone } from "@/lib/timezone"

const DATE_FORMAT = "yyyy-MM-dd"
const TIME_FORMAT = "HH:mm"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  initialData: { start: Date; end: Date; allDay?: boolean } | null
  calendars: Calendar[]
  onSave: (event: Partial<CalendarEvent>, scope?: RecurringEditScope) => void
  onDelete: (eventId: string, scope?: RecurringEditScope) => void
}

export function EventDialog({ open, onOpenChange, event, initialData, calendars, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [calendarId, setCalendarId] = useState("")
  const [allDay, setAllDay] = useState(false)
  const [pendingScopeAction, setPendingScopeAction] = useState<"save" | "delete" | null>(null)

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setStartDate(format(event.start, DATE_FORMAT))
      setStartTime(format(event.start, TIME_FORMAT))
      setEndDate(format(event.end, DATE_FORMAT))
      setEndTime(format(event.end, TIME_FORMAT))
      setAllDay(!!event.allDay)
      // Find calendar name by ID
      const calendar = calendars.find((cal) => cal.id === event.calendarId)
      setCalendarId(calendar?.name || event.calendarId)
    } else if (initialData) {
      setTitle("")
      setDescription("")
      setStartDate(format(initialData.start, DATE_FORMAT))
      setStartTime(format(initialData.start, TIME_FORMAT))
      setEndDate(format(initialData.end, DATE_FORMAT))
      setEndTime(format(initialData.end, TIME_FORMAT))
      setAllDay(!!initialData.allDay)
      setCalendarId(calendars[0]?.name || "")
    }
  }, [event, initialData, calendars])

  const buildEventData = (): Partial<CalendarEvent> => {
    const start = allDay
      ? startOfDay(parse(startDate, DATE_FORMAT, new Date()))
      : parse(`${startDate} ${startTime}`, `${DATE_FORMAT} ${TIME_FORMAT}`, new Date())
    const end = allDay
      ? endOfDay(parse(endDate, DATE_FORMAT, new Date()))
      : parse(`${endDate} ${endTime}`, `${DATE_FORMAT} ${TIME_FORMAT}`, new Date())

    const selectedCalendar = calendars.find((cal) => cal.name === calendarId)
    const selectedCalendarId = selectedCalendar?.id || calendarId

    return { title, description, start, end, calendarId: selectedCalendarId, allDay }
  }

  const handleSave = () => {
    if (event?.recurringEventId) {
      setPendingScopeAction("save")
      return
    }
    onSave(buildEventData())
  }

  const handleDeleteClick = () => {
    if (!event) return
    if (event.recurringEventId) {
      setPendingScopeAction("delete")
      return
    }
    onDelete(event.id)
  }

  const resolveScope = (scope: RecurringEditScope) => {
    if (!event) return
    if (pendingScopeAction === "save") {
      onSave(buildEventData(), scope)
    } else if (pendingScopeAction === "delete") {
      onDelete(event.id, scope)
    }
    setPendingScopeAction(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {event ? "Edit Event" : "Create Event"}
              {event?.recurringEventId && (
                <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <Repeat className="h-3.5 w-3.5" />
                  Recurring
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={allDay} onCheckedChange={setAllDay} />
              All day
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              {!allDay && (
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              {!allDay && (
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              )}
            </div>

            {!allDay && <p className="text-xs text-muted-foreground">Times shown in your local timezone ({getDeviceTimeZone()})</p>}

            <div className="space-y-2">
              <Label htmlFor="calendar">Calendar</Label>
              <Select value={calendarId} onValueChange={(value) => setCalendarId(value || "")}>
                <SelectTrigger id="calendar" className="w-full min-w-30 max-w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((cal) => (
                    <SelectItem key={cal.id} value={cal.name}>
                      {cal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {event && (
              <Button variant="destructive" onClick={handleDeleteClick} className="mr-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {pendingScopeAction && (
        <RecurringScopeDialog
          open
          action={pendingScopeAction}
          onOpenChange={(open) => !open && setPendingScopeAction(null)}
          onChoose={resolveScope}
        />
      )}
    </>
  )
}
