import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import EventService from '@/services/eventService'

// GET /api/events - Get events with various filters
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'all', 'today', 'upcoming', 'range', 'search'
    const includeLocal = searchParams.get('includeLocal') !== 'false'
    const includeGoogle = searchParams.get('includeGoogle') !== 'false'
    const calendarId = searchParams.get('calendarId') || undefined

    const filters = { includeLocal, includeGoogle, calendarId }

    switch (type) {
      case 'today':
        const todayEvents = await EventService.getAllTodayEvents(session.user.id, filters)
        return NextResponse.json({ events: todayEvents })

      case 'upcoming':
        const days = parseInt(searchParams.get('days') || '7')
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const upcomingEvents = await EventService.getAllUpcomingEvents(session.user.id, days, limit, filters)
        return NextResponse.json({ events: upcomingEvents })

      case 'range':
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        if (!startDate || !endDate) {
          return NextResponse.json({ error: 'startDate and endDate are required for range type' }, { status: 400 })
        }
        const rangeEvents = await EventService.getAllEventsInRange(
          session.user.id,
          new Date(startDate),
          new Date(endDate),
          filters
        )
        return NextResponse.json({ events: rangeEvents })

      case 'search':
        const searchTerm = searchParams.get('q')
        if (!searchTerm) {
          return NextResponse.json({ error: 'Search term (q) is required for search type' }, { status: 400 })
        }
        const searchEvents = await EventService.searchAllEvents(session.user.id, searchTerm, filters)
        return NextResponse.json({ events: searchEvents })

      case 'statistics':
        const statistics = await EventService.getEventStatistics(session.user.id, filters)
        return NextResponse.json({ statistics })

      default: // 'all' or no type
        const allEvents = await EventService.getAllEvents(session.user.id, filters)
        return NextResponse.json({ events: allEvents })
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

// POST /api/events - Create event (natural language or structured data)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Natural language creation
    if (body.input && typeof body.input === 'string') {
      const event = await EventService.createEventFromNaturalLanguage(session.user.id, body.input)
      return NextResponse.json({ event }, { status: 201 })
    }
    
    // Structured event creation
    if (body.eventData) {
      const { eventData, options } = body
      
      // Convert date strings to Date objects
      if (eventData.startTime) eventData.startTime = new Date(eventData.startTime)
      if (eventData.endTime) eventData.endTime = new Date(eventData.endTime)

      const event = await EventService.saveEvent(session.user.id, eventData, options)
      return NextResponse.json({ event }, { status: 201 })
    }

    return NextResponse.json({ error: 'Either input (for natural language) or eventData is required' }, { status: 400 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

// PUT /api/events - Update existing event
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventData, options } = body
    
    if (!eventData || !options?.eventId) {
      return NextResponse.json({ error: 'Event data and eventId are required' }, { status: 400 })
    }

    // Convert date strings to Date objects
    if (eventData.startTime) eventData.startTime = new Date(eventData.startTime)
    if (eventData.endTime) eventData.endTime = new Date(eventData.endTime)

    const event = await EventService.saveEvent(session.user.id, eventData, options)
    return NextResponse.json({ event })
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

// DELETE /api/events - Delete event
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const eventId = searchParams.get('eventId')
    const calendarId = searchParams.get('calendarId') || undefined
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    await EventService.deleteEvent(session.user.id, eventId, calendarId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
