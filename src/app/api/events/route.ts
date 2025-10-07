import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { EventService } from '@/lib/eventService'

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = session.user.id
    const type = searchParams.get('type')
    const days = searchParams.get('days')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let events

    if (type === 'upcoming') {
      const daysNum = days ? parseInt(days) : 7
      const limitNum = limit ? parseInt(limit) : undefined
      const offsetNum = offset ? parseInt(offset) : undefined
      events = await EventService.getAllUpcomingEvents(userId, daysNum, limitNum, offsetNum, undefined)
    } else {
      const filters = {
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(limit && { limit: parseInt(limit) }),
        ...(offset && { offset: parseInt(offset) })
      }
      events = await EventService.getAllEvents(userId, Object.keys(filters).length > 0 ? filters : undefined)
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, startTime, endTime, isAllDay, recurrence } = body
    const userId = session.user.id

    if (!title || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const eventData = {
      title,
      description: description || null,
      location: location || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isAllDay: isAllDay || false,
      recurrence: recurrence || 'none'
    }

    const event = await EventService.saveEvent(userId, eventData)

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}