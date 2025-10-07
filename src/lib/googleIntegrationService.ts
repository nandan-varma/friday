import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { db } from '@/lib/db';
import { integrations } from "@/lib/db/schema";
import { eq, and } from 'drizzle-orm';

// Google Calendar scopes
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

export interface GoogleIntegration {
  id: number;
  userId: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
}

export class GoogleIntegrationService {
  /**
   * Get Google API credentials from environment variables
   */
  private static async getCredentials() {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
    const key = credentials.installed || credentials.web;

    if (!key || !key.client_id || !key.client_secret) {
      throw new Error('Invalid Google credentials in environment variable GOOGLE_CREDENTIALS');
    }

    return key;
  }

  /**
   * Create and configure OAuth2 client for Google APIs
   */
  private static async createOAuth2Client(): Promise<OAuth2Client> {
    try {
      const { client_id, client_secret } = await this.getCredentials();
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

      return new google.auth.OAuth2(client_id, client_secret, redirectUri);
    } catch (error) {
      console.error('Error creating OAuth2 client:', error);
      throw new Error('Failed to create OAuth2 client');
    }
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  static async getAuthUrl(): Promise<string> {
    const oAuth2Client = await this.createOAuth2Client();

    return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for access/refresh tokens and save to database
   * @param code - The authorization code from Google OAuth
   * @param userId - The user ID to associate the integration with
   * @returns The saved integration record
   */
  static async exchangeCodeForTokens(code: string, userId: string): Promise<GoogleIntegration> {
    const oAuth2Client = await this.createOAuth2Client();

    try {
      const { tokens } = await oAuth2Client.getToken(code);

      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }

      // Calculate expiration date
      const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : null;

      // Save or update integration in database
      const existingIntegration = await db
        .select()
        .from(integrations)
        .where(
          and(
            eq(integrations.userId, userId),
            eq(integrations.type, 'google_calendar')
          )
        )
        .limit(1);

      let integration: GoogleIntegration;

      if (existingIntegration.length > 0) {
        // Update existing integration
        const [updated] = await db
          .update(integrations)
          .set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, existingIntegration[0].id))
          .returning();

        integration = updated as unknown as GoogleIntegration;
      } else {
        // Create new integration
        const [created] = await db
          .insert(integrations)
          .values({
            userId,
            type: 'google_calendar',
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || null,
            expiresAt,
          })
          .returning();

        integration = created as unknown as GoogleIntegration;
      }

      return integration;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }
  /**
   * Get user's Google Calendar integration from database
   * @param userId - The user ID to look up
   * @returns The integration record or null if not found
   */
  static async getUserIntegration(userId: string): Promise<GoogleIntegration | null> {
    const result = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.type, 'google_calendar')
        )
      )
      .limit(1);

    return result.length > 0 ? (result[0] as unknown as GoogleIntegration) : null;
  }  /**
   * Create authenticated OAuth2 client for a user
   */
  static async createAuthenticatedClient(userId: string): Promise<OAuth2Client | null> {
    const integration = await this.getUserIntegration(userId);

    if (!integration || !integration.accessToken) {
      return null;
    }

    const oAuth2Client = await this.createOAuth2Client();

    // Set the credentials
    oAuth2Client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken,
      expiry_date: integration.expiresAt?.getTime(),
    });

    // Check if token needs refresh
    if (integration.expiresAt && new Date() >= integration.expiresAt) {
      try {
        const { credentials } = await oAuth2Client.refreshAccessToken();

        // Update database with new tokens
        await db
          .update(integrations)
          .set({
            accessToken: credentials.access_token || integration.accessToken,
            refreshToken: credentials.refresh_token || integration.refreshToken,
            expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : integration.expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(integrations.id, integration.id));

        oAuth2Client.setCredentials(credentials);
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }

    return oAuth2Client;
  }
  /**
   * Check if user has valid Google Calendar integration by testing API access
   * @param userId - The user ID to check
   * @returns True if integration is valid and working
   */
  static async hasValidIntegration(userId: string): Promise<boolean> {
    try {
      const client = await this.createAuthenticatedClient(userId);
      if (!client) return false;

      // Try to make a simple API call to verify credentials
      const calendar = google.calendar({ version: 'v3', auth: client });
      await calendar.calendarList.list({ maxResults: 1 });

      return true;
    } catch (error) {
      console.error('Error checking integration validity:', error);
      return false;
    }
  }
  /**
   * Fetch events from Google Calendar
   * @param userId - The user ID to fetch events for
   * @param options - Query options for filtering events
   * @returns Array of Google Calendar events
   */
  static async getCalendarEvents(
    userId: string,
    options: {
      maxResults?: number;
      timeMin?: Date;
      timeMax?: Date;
      calendarId?: string;
    } = {}
  ): Promise<GoogleCalendarEvent[]> {
    const client = await this.createAuthenticatedClient(userId);

    if (!client) {
      throw new Error('Google Calendar not connected or invalid credentials');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });

    const {
      maxResults = 50,
      timeMin = new Date(),
      timeMax,
      calendarId = 'primary'
    } = options;

    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin.toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items || []) as GoogleCalendarEvent[];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }
  /**
   * Create a new event in Google Calendar
   * @param userId - The user ID to create event for
   * @param event - The event data to create
   * @param calendarId - The calendar ID to create event in (defaults to primary)
   * @returns The created Google Calendar event
   */
  static async createCalendarEvent(
    userId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    const client = await this.createAuthenticatedClient(userId);

    if (!client) {
      throw new Error('Google Calendar not connected or invalid credentials');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      return response.data as GoogleCalendarEvent;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }
  /**
   * Update an existing event in Google Calendar
   * @param userId - The user ID to update event for
   * @param eventId - The Google Calendar event ID to update
   * @param event - The updated event data
   * @param calendarId - The calendar ID containing the event (defaults to primary)
   * @returns The updated Google Calendar event
   */
  static async updateCalendarEvent(
    userId: string,
    eventId: string,
    event: Partial<GoogleCalendarEvent>,
    calendarId: string = 'primary'
  ): Promise<GoogleCalendarEvent> {
    const client = await this.createAuthenticatedClient(userId);

    if (!client) {
      throw new Error('Google Calendar not connected or invalid credentials');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: event,
      });

      return response.data as GoogleCalendarEvent;
    } catch (error: any) {
      console.error('Error updating Google Calendar event:', error);
      console.error('Event data:', event);
      console.error('Event ID:', eventId);
      console.error('Calendar ID:', calendarId);

      // Provide more specific error information
      if (error.response) {
        console.error('Google API Error Response:', error.response.data);
        throw new Error(`Google Calendar API error: ${error.response.data.error?.message || 'Unknown error'}`);
      } else if (error.message) {
        throw new Error(`Failed to update Google Calendar event: ${error.message}`);
      } else {
        throw new Error('Failed to update Google Calendar event');
      }
    }
  }
  /**
   * Delete an event from Google Calendar
   * @param userId - The user ID to delete event for
   * @param eventId - The Google Calendar event ID to delete
   * @param calendarId - The calendar ID containing the event (defaults to primary)
   */
  static async deleteCalendarEvent(
    userId: string,
    eventId: string,
    calendarId: string = 'primary'
  ): Promise<void> {
    const client = await this.createAuthenticatedClient(userId);

    if (!client) {
      throw new Error('Google Calendar not connected or invalid credentials');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      await calendar.events.delete({
        calendarId,
        eventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete Google Calendar event');
    }
  }
  /**
   * Get list of user's calendars
   * @param userId - The user ID to get calendars for
   * @returns Array of calendar objects
   */
  static async getCalendarList(userId: string) {
    const client = await this.createAuthenticatedClient(userId);

    if (!client) {
      throw new Error('Google Calendar not connected or invalid credentials');
    }

    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
      const response = await calendar.calendarList.list();
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar list:', error);
      throw new Error('Failed to fetch calendar list');
    }
  }
  /**
   * Disconnect Google Calendar integration for a user
   * @param userId - The user ID to disconnect integration for
   */
  static async disconnectIntegration(userId: string): Promise<void> {
    await db
      .delete(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.type, 'google_calendar')
        )
      );
  }
}