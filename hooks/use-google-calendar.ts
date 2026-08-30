import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authClient } from "@/lib/auth-client"
import type { CalendarEvent } from "@/types/calendar"

// Integration status types
interface IntegrationStatus {
  connected: boolean
  googleUserId?: string
  lastSyncAt?: string
  selectedCalendarIds?: string[]
}

// Google Calendar types
interface GoogleCalendar {
  id: string
  summary: string
  description?: string
  primary?: boolean
  accessRole?: string
  backgroundColor?: string
}

interface GoogleEvent {
  id: string
  calendarId: string
  summary?: string
  description?: string
  start?: {
    dateTime?: string
    date?: string
  }
  end?: {
    dateTime?: string
    date?: string
  }
  location?: string
  attendees?: Array<{ email: string }>
  htmlLink?: string
}



// Fetch integration status
export function useGoogleIntegration() {
  return useQuery<IntegrationStatus>({
    queryKey: ["google-integration"],
    queryFn: async () => {
      const response = await fetch("/api/integrations/google")
      if (!response.ok) {
        throw new Error("Failed to fetch integration status")
      }
      return response.json()
    },
  })
}

// Fetch calendars
export function useGoogleCalendars() {
  const { data: integration } = useGoogleIntegration()

  return useQuery<GoogleCalendar[]>({
    queryKey: ["google-calendars"],
    queryFn: async () => {
      const response = await fetch("/api/calendars")
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized")
        }
        if (response.status === 400) {
          throw new Error("Google Calendar not connected")
        }
        throw new Error("Failed to fetch calendars")
      }
      return response.json()
    },
    enabled: integration?.connected === true,
  })
}

// Fetch events
export function useGoogleEvents(
  options?: {
    start?: Date
    end?: Date
    calendarId?: string
  }
) {
  const { data: integration } = useGoogleIntegration()

  return useQuery<CalendarEvent[]>({
    queryKey: ["google-events", options?.start, options?.end, options?.calendarId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (options?.start) params.append("start", options.start.toISOString())
      if (options?.end) params.append("end", options.end.toISOString())
      if (options?.calendarId) params.append("calendarId", options.calendarId)

      const response = await fetch(`/api/events?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch events")
      }
      const events = await response.json()
      // Convert string dates back to Date objects
      return events.map((event: any) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    },
    enabled: integration?.connected === true,
  })
}

// Connect Google Calendar - links Calendar scope to the account via Better
// Auth. Redirects to Google's consent screen; the callback lands back on /app.
export function useConnectGoogle() {
  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.linkSocial({
        provider: "google",
        scopes: ["https://www.googleapis.com/auth/calendar"],
        callbackURL: "/app",
      })
      if (error) throw new Error(error.message || "Failed to connect Google Calendar")
    },
  })
}

// Disconnect Google Calendar
export function useDisconnectGoogle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data: accounts, error: listError } = await authClient.listAccounts()
      if (listError) throw new Error(listError.message || "Failed to disconnect")

      const googleAccount = accounts?.find((a) => a.providerId === "google")
      if (!googleAccount) return

      const { error } = await authClient.unlinkAccount({ accountId: googleAccount.id })
      if (error) throw new Error(error.message || "Failed to disconnect")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-integration"] })
      queryClient.invalidateQueries({ queryKey: ["google-calendars"] })
      queryClient.invalidateQueries({ queryKey: ["google-events"] })
    },
  })
}

// Update selected calendars
export function useUpdateSelectedCalendars() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (calendarIds: string[]) => {
      const response = await fetch("/api/calendars", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ calendarIds }),
      })
      if (!response.ok) {
        throw new Error("Failed to update selected calendars")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-integration"] })
      queryClient.invalidateQueries({ queryKey: ["google-events"] })
    },
  })
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (eventData: {
      calendarId: string
      summary: string
      description?: string
      location?: string
      start: Date
      end: Date
      attendees?: string[]
    }) => {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...eventData,
          start: eventData.start.toISOString(),
          end: eventData.end.toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to create event")
      }
      const event = await response.json()
      // Convert string dates back to Date objects
      return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-events"] })
    },
  })
}

// Update event
export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      calendarId,
      updates,
    }: {
      eventId: string
      calendarId: string
      updates: {
        summary?: string
        description?: string
        location?: string
        start?: Date
        end?: Date
        attendees?: string[]
      }
    }) => {
      const response = await fetch("/api/events", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          calendarId,
          ...updates,
          start: updates.start?.toISOString(),
          end: updates.end?.toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to update event")
      }
      const event = await response.json()
      // Convert string dates back to Date objects
      return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }
    },
    onMutate: async ({ eventId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["google-events"] })

      // Snapshot previous value
      const previousEvents = queryClient.getQueriesData<CalendarEvent[]>({ queryKey: ["google-events"] })

      // Optimistically update all matching queries
      queryClient.setQueriesData<CalendarEvent[]>(
        { queryKey: ["google-events"] },
        (old) => {
          if (!old) return old
          return old.map((event) =>
            event.id === eventId
              ? {
                  ...event,
                  ...(updates.summary !== undefined && { title: updates.summary }),
                  ...(updates.description !== undefined && { description: updates.description }),
                  ...(updates.location !== undefined && { location: updates.location }),
                  ...(updates.start !== undefined && { start: updates.start }),
                  ...(updates.end !== undefined && { end: updates.end }),
                  ...(updates.attendees !== undefined && { attendees: updates.attendees }),
                }
              : event
          )
        }
      )

      // Return context for rollback
      return { previousEvents }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ["google-events"] })
    },
  })
}

// Delete event
export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      eventId,
      calendarId,
    }: {
      eventId: string
      calendarId: string
    }) => {
      const response = await fetch(
        `/api/events?id=${eventId}&calendarId=${calendarId}`,
        {
          method: "DELETE",
        }
      )
      if (!response.ok) {
        throw new Error("Failed to delete event")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-events"] })
    },
  })
}
