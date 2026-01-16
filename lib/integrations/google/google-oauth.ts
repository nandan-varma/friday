import { google } from "googleapis";
import { db } from "@/db";
import { googleCalendarIntegration } from "@/db/schema/integrations";
import { eq } from "drizzle-orm";
import { encryptToken, decryptToken } from "@/lib/crypto-utils";

interface GoogleCredentials {
  web: {
    client_id: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

// Parse Google credentials from environment
function getGoogleCredentials(): GoogleCredentials {
  const credentials = process.env.GOOGLE_CREDENTIALS;
  if (!credentials) {
    throw new Error("GOOGLE_CREDENTIALS environment variable is not set");
  }
  return JSON.parse(credentials);
}

// Create OAuth2 client
export function createOAuth2Client() {
  const credentials = getGoogleCredentials();
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!redirectUri) {
    throw new Error("GOOGLE_REDIRECT_URI environment variable is not set");
  }

  return new google.auth.OAuth2(
    credentials.web.client_id,
    credentials.web.client_secret,
    redirectUri
  );
}

// Generate authorization URL for OAuth flow
export function getAuthorizationUrl(state?: string): string {
  const oauth2Client = createOAuth2Client();

  return oauth2Client.generateAuthUrl({
    access_type: "offline", // Required for refresh token
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent", // Force consent screen to get refresh token
    state: state, // Optional state parameter for CSRF protection
  });
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = createOAuth2Client();

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token,
    tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
  };
}

// Get user info from Google
export async function getGoogleUserInfo(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    googleUserId: data.id!,
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

// Store integration in database
export async function storeIntegration(
  userId: string,
  googleUserId: string,
  accessToken: string,
  refreshToken: string | undefined,
  tokenExpiry: Date
) {
  // Check if integration already exists
  const existing = await getIntegration(userId);

  if (existing) {
    // Update existing integration
    const [updated] = await db
      .update(googleCalendarIntegration)
      .set({
        googleUserId,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : null,
        tokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarIntegration.userId, userId))
      .returning();

    return updated;
  } else {
    // Insert new integration
    const [created] = await db
      .insert(googleCalendarIntegration)
      .values({
        id: `gcal_${userId}_${Date.now()}`,
        userId,
        googleUserId,
        accessToken: encryptToken(accessToken),
        refreshToken: refreshToken ? encryptToken(refreshToken) : null,
        tokenExpiry,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return created;
  }
}

// Get integration for user
export async function getIntegration(userId: string) {
  const integrations = await db
    .select()
    .from(googleCalendarIntegration)
    .where(eq(googleCalendarIntegration.userId, userId))
    .limit(1);

  const integration = integrations[0];
  if (integration) {
    return {
      ...integration,
      accessToken: decryptToken(integration.accessToken),
      refreshToken: integration.refreshToken ? decryptToken(integration.refreshToken) : null,
    };
  }
  return null;
}

// Refresh access token
export async function refreshAccessToken(userId: string): Promise<string> {
  const integration = await getIntegration(userId);

  if (!integration) {
    throw new Error("No Google Calendar integration found for user");
  }

  if (!integration.refreshToken) {
    throw new Error("No refresh token available. User needs to reconnect.");
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: integration.refreshToken,
  });

  try {
    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update tokens in database
    await db
      .update(googleCalendarIntegration)
      .set({
        accessToken: encryptToken(credentials.access_token!),
        tokenExpiry: credentials.expiry_date
          ? new Date(credentials.expiry_date)
          : new Date(Date.now() + 3600 * 1000),
        updatedAt: new Date(),
      })
      .where(eq(googleCalendarIntegration.userId, userId));

    return credentials.access_token!;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    // Revoke integration on failure
    await revokeIntegration(userId);
    throw new Error("Failed to refresh access token. Please reconnect your Google account.");
  }
}

// Get valid access token (refreshes if expired)
export async function getValidAccessToken(userId: string): Promise<string> {
  const integration = await getIntegration(userId);

  if (!integration) {
    throw new Error("No Google Calendar integration found for user");
  }

  // Check if token is expired or will expire in next 5 minutes
  const now = new Date();
  const expiryThreshold = new Date(now.getTime() + 5 * 60 * 1000);

  if (integration.tokenExpiry <= expiryThreshold) {
    return await refreshAccessToken(userId);
  }

  return integration.accessToken;
}

// Create authenticated OAuth2 client for user
export async function getAuthenticatedClient(userId: string) {
  const accessToken = await getValidAccessToken(userId);
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });

  return oauth2Client;
}

// Revoke access and delete integration
export async function revokeIntegration(userId: string) {
  const integration = await getIntegration(userId);

  if (!integration) {
    return;
  }

  try {
    // Revoke the token with Google
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: integration.accessToken });
    await oauth2Client.revokeCredentials();
  } catch (error) {
    console.error("Failed to revoke token with Google:", error);
    // Continue with deletion even if revocation fails
  }

  // Delete from database
  await db
    .delete(googleCalendarIntegration)
    .where(eq(googleCalendarIntegration.userId, userId));
}
