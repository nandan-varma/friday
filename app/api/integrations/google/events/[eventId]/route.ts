import { NextRequest, NextResponse } from 'next/server';
import { GoogleIntegrationService } from '@/services/googleIntegrationService';

export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { userId, event, calendarId } = await request.json();
    const { eventId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: 'Event data is required' },
        { status: 400 }
      );
    }

    const updatedEvent = await GoogleIntegrationService.updateCalendarEvent(
      userId,
      eventId,
      event,
      calendarId || 'primary'
    );
    
    return NextResponse.json({ 
      success: true,
      event: updatedEvent
    });
  } catch (error) {
    console.error('Error updating Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('userId') || '0');
    const calendarId = searchParams.get('calendarId') || 'primary';
    const { eventId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await GoogleIntegrationService.deleteCalendarEvent(userId, eventId, calendarId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
