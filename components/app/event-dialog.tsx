"use client"

import { useState, useEffect } from "react"
import type { CalendarEvent, Calendar } from "@/types/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  initialData: { start: Date; end: Date } | null
  calendars: Calendar[]
  onSave: (event: Partial<CalendarEvent>) => void
  onDelete: (eventId: string) => void
}

export function EventDialog({ open, onOpenChange, event, initialData, calendars, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endTime, setEndTime] = useState("")
  const [calendarId, setCalendarId] = useState("")

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDescription(event.description || "")
      setStartDate(event.start.toISOString().split("T")[0])
      setStartTime(event.start.toTimeString().slice(0, 5))
      setEndDate(event.end.toISOString().split("T")[0])
      setEndTime(event.end.toTimeString().slice(0, 5))
      setCalendarId(event.calendarId)
    } else if (initialData) {
      setTitle("")
      setDescription("")
      setStartDate(initialData.start.toISOString().split("T")[0])
      setStartTime(initialData.start.toTimeString().slice(0, 5))
      setEndDate(initialData.end.toISOString().split("T")[0])
      setEndTime(initialData.end.toTimeString().slice(0, 5))
      setCalendarId(calendars[0]?.id || "")
    }
  }, [event, initialData, calendars])

  const handleSave = () => {
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number)
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endYear, endMonth, endDay] = endDate.split("-").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)

    const start = new Date(startYear, startMonth - 1, startDay, startHour, startMin)
    const end = new Date(endYear, endMonth - 1, endDay, endHour, endMin)

    onSave({
      title,
      description,
      start,
      end,
      calendarId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input id="end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="calendar">Calendar</Label>
            <Select value={calendarId} onValueChange={(value) => setCalendarId(value || "")}>
              <SelectTrigger id="calendar">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((cal) => (
                  <SelectItem key={cal.id} value={cal.id}>
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
            <Button variant="destructive" onClick={() => onDelete(event.id)} className="mr-auto">
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
  )
}
