/**
 * Google Calendar Integration
 * 
 * This module handles Google Calendar API integration using OAuth2.
 * 
 * Environment Variables Required:
 * - GOOGLE_CREDENTIALS: JSON string containing Google OAuth2 client credentials
 * - GOOGLE_REFRESH_TOKEN: Refresh token for authenticated user (obtained after OAuth flow)
 * - GOOGLE_REDIRECT_URI: OAuth2 redirect URI (optional, defaults to localhost:3000)
 * 
 * Note: This implementation does NOT write to any files. All credentials are managed 
 * through environment variables only.
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// OAuth2 scopes for Google Calendar API
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

export interface GoogleCalendarEvent {
  id?: string;
  summary?: string;
  description?: string;
  start?: {
    dateTime?: string;
    date?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  attendees?: Array<{
    email?: string;
    displayName?: string;
    responseStatus?: string;
  }>;
}

/**
 * Create OAuth2 client with credentials from environment
 */
function getCredentialsFromEnv() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const key = credentials.installed || credentials.web;
    
    if (!key || !key.client_id || !key.client_secret) {
      throw new Error('Invalid Google credentials in environment variable GOOGLE_CREDENTIALS. Make sure it contains valid Google OAuth2 credentials.');
    }
    
    return key;
  } catch (error) {
    console.error('Error parsing Google credentials from environment:', error);
    throw error;
  }
}

/**
 * Create OAuth2 client with refresh token from environment
 */
export function createAuthenticatedOAuth2Client(): OAuth2Client | null {
  try {
    const key = getCredentialsFromEnv();
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    
    if (!refreshToken) {
      console.warn('No GOOGLE_REFRESH_TOKEN found in environment');
      return null;
    }
    
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    const oAuth2Client = new google.auth.OAuth2(key.client_id, key.client_secret, redirectUri);
    
    oAuth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    
    return oAuth2Client;
  } catch (error) {
    console.error('Error creating authenticated OAuth2 client:', error);
    return null;
  }
}

/**
 * Create OAuth2 client for initial authorization flow
 */
export function createOAuth2Client(): OAuth2Client {
  try {
    const key = getCredentialsFromEnv();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    
    return new google.auth.OAuth2(key.client_id, key.client_secret, redirectUri);
  } catch (error) {
    console.error('Error creating OAuth2 client:', error);
    throw error;
  }
}

/**
 * Get authorization URL for OAuth flow
 */
export function getAuthUrl(): string {
  const oAuth2Client = createOAuth2Client();
  
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
}

/**
 * Exchange authorization code for tokens
 * Note: This will return the tokens but won't save them to file.
 * You should store the refresh_token in your environment variables.
 */
export async function getTokens(code: string): Promise<{ client: OAuth2Client, tokens: any }> {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  
  // Return both the client and tokens so the caller can handle the refresh_token
  return { client: oAuth2Client, tokens };
}

/**
 * Get an authenticated OAuth2 client or return null if not available
 */
export function getAuthenticatedClient(): OAuth2Client | null {
  return createAuthenticatedOAuth2Client();
}

/**
 * Lists upcoming events from the user's primary calendar.
 */
export async function listEvents(auth?: OAuth2Client, maxResults: number = 10): Promise<GoogleCalendarEvent[]> {
  const client = auth || createAuthenticatedOAuth2Client();
  if (!client) {
    throw new Error('No authenticated Google Calendar client available. Please ensure GOOGLE_REFRESH_TOKEN is set.');
  }
  
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return (res.data.items || []) as GoogleCalendarEvent[];
}

/**
 * Create a new event in the user's primary calendar.
 */
export async function createEvent(
  event: Partial<GoogleCalendarEvent>,
  auth?: OAuth2Client
): Promise<GoogleCalendarEvent> {
  const client = auth || createAuthenticatedOAuth2Client();
  if (!client) {
    throw new Error('No authenticated Google Calendar client available. Please ensure GOOGLE_REFRESH_TOKEN is set.');
  }
  
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  
  return res.data as GoogleCalendarEvent;
}

/**
 * Update an existing event in the user's primary calendar.
 */
export async function updateEvent(
  eventId: string,
  event: Partial<GoogleCalendarEvent>,
  auth?: OAuth2Client
): Promise<GoogleCalendarEvent> {
  const client = auth || createAuthenticatedOAuth2Client();
  if (!client) {
    throw new Error('No authenticated Google Calendar client available. Please ensure GOOGLE_REFRESH_TOKEN is set.');
  }
  
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId,
    requestBody: event,
  });
  
  return res.data as GoogleCalendarEvent;
}

/**
 * Delete an event from the user's primary calendar.
 */
export async function deleteEvent(eventId: string, auth?: OAuth2Client): Promise<void> {
  const client = auth || createAuthenticatedOAuth2Client();
  if (!client) {
    throw new Error('No authenticated Google Calendar client available. Please ensure GOOGLE_REFRESH_TOKEN is set.');
  }
  
  const calendar = google.calendar({ version: 'v3', auth: client });
  
  await calendar.events.delete({
    calendarId: 'primary',
    eventId,
  });
}

/**
 * Check if user has valid Google Calendar credentials
 */
export async function hasValidCredentials(): Promise<boolean> {
  try {
    const client = createAuthenticatedOAuth2Client();
    if (!client) return false;
    
    // Try to make a simple API call to verify credentials
    const calendar = google.calendar({ version: 'v3', auth: client });
    await calendar.calendarList.list({ maxResults: 1 });
    
    return true;
  } catch (err) {
    return false;
  }
}
