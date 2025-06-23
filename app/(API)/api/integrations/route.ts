import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import EventService from '@/services/eventService'

// GET /api/integrations - Get integration status
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const status = await EventService.getIntegrationStatus(session.user.id)
    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error fetching integration status:', error)
    return NextResponse.json({ error: 'Failed to fetch integration status' }, { status: 500 })
  }
}
