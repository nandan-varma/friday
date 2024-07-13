'use client'

import { useCalendar } from "@/lib/hooks/use-calendar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { useEffect } from "react"

export interface Event {
    name: string,
    date: string,
}

export interface AddEventProps {
    propEvent: Event
}

export function AddEvent(
    { propEvent }: AddEventProps) {

    const { events, setEvents } = useCalendar()

    useEffect(() => {

        if (!propEvent) {
            return
        }

        setEvents((prevEvents) => {
            // dont duplicate if it re renders
            if (prevEvents.find((event) => event.date === propEvent.date)) {
                return prevEvents
            }
            return [...prevEvents, propEvent]
        })
    })
    return (
        <div>
            <Card>
                <CardHeader><CardTitle>
                    Event Added for {propEvent.name}
                </CardTitle></CardHeader>
                <CardContent> on {propEvent.date} </CardContent>
                <CardFooter>
                    Event Added
                </CardFooter>
            </Card>
        </div>
    )
}