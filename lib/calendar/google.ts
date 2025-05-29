import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

// If modifying these scopes, delete token.json.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events'
];

// The file token.json stores the user's access and refresh tokens
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

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
 * Reads previously authorized credentials from the save file.
 */
async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 */
async function saveCredentials(client: OAuth2Client): Promise<void> {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  } catch (err) {
    console.error('Error saving credentials:', err);
    throw err;
  }
}

/**
 * Load or request authorization to call APIs.
 */
export async function authorize(): Promise<OAuth2Client | null> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  return null; // Return null if no saved credentials, OAuth flow should be handled by frontend
}

/**
 * Create OAuth2 client with credentials
 */
export function createOAuth2Client(): OAuth2Client {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
  const { client_secret, client_id } = credentials.installed || credentials.web;
  
  // Use the callback URL from environment or default to localhost
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
  
  return new google.auth.OAuth2(client_id, client_secret, redirectUri);
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
 */
export async function getTokens(code: string): Promise<OAuth2Client> {
  const oAuth2Client = createOAuth2Client();
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  
  // Save credentials for future use
  await saveCredentials(oAuth2Client);
  
  return oAuth2Client;
}

/**
 * Lists upcoming events from the user's primary calendar.
 */
export async function listEvents(auth: OAuth2Client, maxResults: number = 10): Promise<GoogleCalendarEvent[]> {
  const calendar = google.calendar({ version: 'v3', auth });
  
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
  auth: OAuth2Client,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> {
  const calendar = google.calendar({ version: 'v3', auth });
  
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
  auth: OAuth2Client,
  eventId: string,
  event: Partial<GoogleCalendarEvent>
): Promise<GoogleCalendarEvent> {
  const calendar = google.calendar({ version: 'v3', auth });
  
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
export async function deleteEvent(auth: OAuth2Client, eventId: string): Promise<void> {
  const calendar = google.calendar({ version: 'v3', auth });
  
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
    const client = await loadSavedCredentialsIfExist();
    if (!client) return false;
    
    // Try to make a simple API call to verify credentials
    const calendar = google.calendar({ version: 'v3', auth: client });
    await calendar.calendarList.list({ maxResults: 1 });
    
    return true;
  } catch (err) {
    return false;
  }
}
