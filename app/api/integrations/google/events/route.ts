import { NextRequest, NextResponse } from 'next/server';
import { GoogleIntegrationService } from '@/services/googleIntegrationService';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from cookie instead of query params
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    const timeMin = searchParams.get('timeMin') ? new Date(searchParams.get('timeMin')!) : new Date();
    const timeMax = searchParams.get('timeMax') ? new Date(searchParams.get('timeMax')!) : undefined;
    const calendarId = searchParams.get('calendarId') || 'primary';

    // Check if user has valid integration
    const hasValidIntegration = await GoogleIntegrationService.hasValidIntegration(user.id);
    
    if (!hasValidIntegration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected or invalid credentials' },
        { status: 401 }
      );
    }
    
    // Fetch events directly from Google Calendar (no caching)
    const events = await GoogleIntegrationService.getCalendarEvents(user.id, {
      maxResults,
      timeMin,
      timeMax,
      calendarId,
    });
    
    return NextResponse.json({ 
      events,
      source: 'google_calendar',
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    
    let errorMessage = 'Failed to fetch events';
    if (error instanceof Error) {
      if (error.message.includes('not connected')) {
        errorMessage = 'Google Calendar not connected. Please connect your account first.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user from cookie instead of request body
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { event, calendarId } = await request.json();

    if (!event) {
      return NextResponse.json(
        { error: 'Event data is required' },
        { status: 400 }
      );
    }

    const createdEvent = await GoogleIntegrationService.createCalendarEvent(
      user.id,
      event,
      calendarId || 'primary'
    );
    
    return NextResponse.json({ 
      success: true,
      event: createdEvent
    });
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
