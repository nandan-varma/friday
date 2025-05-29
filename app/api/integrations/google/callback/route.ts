import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/calendar/google';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    const oAuth2Client = await getTokens(code);
    
    return NextResponse.json({ 
      success: true,
      message: 'Google Calendar connected successfully'
    });
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 }
    );
  }
}
