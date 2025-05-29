import { NextRequest, NextResponse } from 'next/server';
import { authorize, listEvents } from '@/lib/calendar/google';

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize();
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '10');
    
    const events = await listEvents(auth, maxResults);
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
