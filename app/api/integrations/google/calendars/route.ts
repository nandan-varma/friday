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

    const calendars = await GoogleIntegrationService.getCalendarList(user.id);
    
    return NextResponse.json({ 
      calendars,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching calendar list:', error);
    
    let errorMessage = 'Failed to fetch calendar list';
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
