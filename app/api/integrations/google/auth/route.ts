import { NextRequest, NextResponse } from 'next/server';
import { GoogleIntegrationService } from '@/services/googleIntegrationService';

export async function GET() {
  try {
    const authUrl = GoogleIntegrationService.getAuthUrl();
    
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
