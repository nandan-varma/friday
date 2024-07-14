'use client'

import { useState } from "react"
import { Calendar } from "../ui/calendar"
import { Event } from "./add-event"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { parseISO } from "date-fns"
import { useCalendar } from "@/lib/hooks/use-calendar"

interface MonthViewProps {
    events?: Event[]
}

export function MonthView({ events: propEvents }: MonthViewProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const { events } = useCalendar()
    if (!propEvents) {
        propEvents = events
    }

    return (
        <div className="grid md:flex">
            <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
            />
            <div className="m-1 h-96 overflow-y-scroll md:flex-1">
                {events.map((event, index) => (
                    <Card key={index} className="m-2">
                        <CardHeader>
                            <CardTitle>
                                {event.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            on {(parseISO(event.date)).toLocaleDateString()}
                            {" "}
                            at {(parseISO(event.date)).toLocaleTimeString()}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}