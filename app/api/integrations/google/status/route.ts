import { NextRequest, NextResponse } from 'next/server';
import { authorize, hasValidCredentials } from '@/lib/calendar/google';

export async function GET() {
  try {
    const isConnected = await hasValidCredentials();
    
    return NextResponse.json({ connected: isConnected });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}
