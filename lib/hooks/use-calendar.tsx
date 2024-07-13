'use client'

import { Event } from '@/components/calendar/add-event'
import * as React from 'react'

const LOCAL_STORAGE_KEY = 'calendar'

interface CalendarContext {
    isLoading: boolean
    events: Event[]
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>
}

const CalendarContext = React.createContext<CalendarContext | undefined>(
    undefined
)

export function useCalendar() {
    const context = React.useContext(CalendarContext)
    if (!context) {
        throw new Error('useCalendarContext must be used within a CalendarProvider')
    }
    return context
}

interface CalendarProviderProps {
    children: React.ReactNode
}

export function CalendarProvider({ children }: CalendarProviderProps) {
    const [isLoading, setLoading] = React.useState(true)

    const [events, setEvents] = React.useState<Event[]>([])

    React.useEffect(() => {
        setLoading(false)
        setEvents((prevEvents) => {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY)
            if (!data) {
                return prevEvents
            }
            return JSON.parse(data)
        })
    }, [])

    React.useEffect(() => {
        if (events.length !== 0) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events))
        }
    }, [events])

    if (isLoading) {
        return null
    }

    return (
        <CalendarContext.Provider
            value={{ isLoading, events, setEvents }}
        >
            {children}
        </CalendarContext.Provider>
    )
}
