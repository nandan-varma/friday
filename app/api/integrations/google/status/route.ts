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
    
    const isConnected = await GoogleIntegrationService.hasValidIntegration(user.id);
    const integration = await GoogleIntegrationService.getUserIntegration(user.id);
    
    return NextResponse.json({ 
      connected: isConnected,
      integration: integration ? {
        id: integration.id,
        expiresAt: integration.expiresAt,
        hasRefreshToken: !!integration.refreshToken
      } : null
    });
  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from cookie instead of query params
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    await GoogleIntegrationService.disconnectIntegration(user.id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Google Calendar disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}
