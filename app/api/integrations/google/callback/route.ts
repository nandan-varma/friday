import { NextRequest, NextResponse } from 'next/server';
import { GoogleIntegrationService } from '@/services/googleIntegrationService';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Get user from cookie instead of request body
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Check if Google credentials are properly configured
    if (!process.env.GOOGLE_CREDENTIALS) {
      console.error('GOOGLE_CREDENTIALS environment variable is not set');
      return NextResponse.json(
        { error: 'Google Calendar integration is not properly configured' },
        { status: 500 }
      );
    }
    
    const integration = await GoogleIntegrationService.exchangeCodeForTokens(code, user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Google Calendar connected successfully',
      integration: {
        id: integration.id,
        connected: true
      }
    });
  } catch (error) {
    console.error('Error exchanging authorization code:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to exchange authorization code';
    if (error instanceof Error) {
      if (error.message.includes('Invalid Google credentials')) {
        errorMessage = 'Google Calendar integration is not properly configured. Please check your credentials.';
      } else if (error.message.includes('invalid_grant')) {
        errorMessage = 'Authorization code has expired or is invalid. Please try connecting again.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
