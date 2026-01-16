import { db } from "@/db";
import { githubIntegration } from "@/db/schema/integrations";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET!;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/auth/github/callback`;

// Required scopes for standup summaries:
// - read:user: Read user profile information
// - repo: Full control of private repositories (includes read access to commits, issues, PRs)
// - read:org: Read organization membership and teams
// - read:project: Read access to projects
const GITHUB_SCOPES = [
  "read:user",
  "user:email",
  "repo",
  "read:org",
  "read:project",
].join(" ");

/**
 * Generate GitHub OAuth authorization URL
 */
export function getAuthorizationUrl(userId: string): string {
  const state = Buffer.from(JSON.stringify({ userId, nonce: nanoid() })).toString("base64");
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: GITHUB_SCOPES,
    state,
    allow_signup: "false", // User must already have a GitHub account
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  scope: string;
}> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange code for token: ${error}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    tokenExpiry: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
    scope: data.scope || GITHUB_SCOPES,
  };
}

/**
 * Get GitHub user information
 */
export async function getGithubUserInfo(accessToken: string): Promise<{
  githubUserId: string;
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
}> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch GitHub user info: ${error}`);
  }

  const user = await response.json();

  return {
    githubUserId: user.id.toString(),
    username: user.login,
    email: user.email || "",
    name: user.name || user.login,
    avatarUrl: user.avatar_url,
  };
}

/**
 * Store GitHub integration in database
 */
export async function storeIntegration(
  userId: string,
  githubUserId: string,
  githubUsername: string,
  accessToken: string,
  refreshToken: string | undefined,
  tokenExpiry: Date | undefined,
  scope: string
): Promise<void> {
  // Check if integration already exists
  const existing = await getIntegration(userId);

  if (existing) {
    // Update existing integration
    await db
      .update(githubIntegration)
      .set({
        githubUserId,
        githubUsername,
        accessToken,
        refreshToken,
        tokenExpiry,
        scope,
        updatedAt: new Date(),
      })
      .where(eq(githubIntegration.userId, userId));
  } else {
    // Insert new integration
    const integrationId = nanoid();
    await db.insert(githubIntegration).values({
      id: integrationId,
      userId,
      githubUserId,
      githubUsername,
      accessToken,
      refreshToken,
      tokenExpiry,
      scope,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

/**
 * Get GitHub integration for a user
 */
export async function getIntegration(userId: string) {
  const [integration] = await db
    .select()
    .from(githubIntegration)
    .where(eq(githubIntegration.userId, userId))
    .limit(1);

  return integration || null;
}

/**
 * Revoke GitHub integration
 */
export async function revokeIntegration(userId: string): Promise<void> {
  const integration = await getIntegration(userId);

  if (!integration) {
    return;
  }

  // Revoke the token on GitHub's side
  try {
    await fetch(
      `https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(`${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`).toString("base64")}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({
          access_token: integration.accessToken,
        }),
      }
    );
  } catch (error) {
    console.error("Failed to revoke GitHub token:", error);
    // Continue with deletion even if revocation fails
  }

  // Delete from database
  await db.delete(githubIntegration).where(eq(githubIntegration.userId, userId));
}

/**
 * Refresh access token if needed
 */
export async function refreshAccessToken(userId: string): Promise<string> {
  const integration = await getIntegration(userId);

  if (!integration) {
    throw new Error("No GitHub integration found");
  }

  // GitHub OAuth tokens don't expire by default, but check if we have expiry set
  if (integration.tokenExpiry && integration.tokenExpiry > new Date()) {
    return integration.accessToken;
  }

  // If token has expired and we have a refresh token, refresh it
  if (integration.refreshToken) {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: integration.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh GitHub token");
    }

    const data = await response.json();

    // Update token in database
    await db
      .update(githubIntegration)
      .set({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenExpiry: data.expires_in ? new Date(Date.now() + data.expires_in * 1000) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(githubIntegration.userId, userId));

    return data.access_token;
  }

  return integration.accessToken;
}

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(path: string, options: RequestInit = {}): string {
  return `${path}:${JSON.stringify(options)}`;
}

function getCachedResponse(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired
  }
  return null;
}

function setCachedResponse(key: string, data: any): void {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

/**
 * Get GitHub API client with authentication and caching
 */
export async function getGithubClient(userId: string) {
  const accessToken = await refreshAccessToken(userId);

  return {
    fetch: async (path: string, options: RequestInit = {}) => {
      const cacheKey = getCacheKey(path, options);
      const cached = getCachedResponse(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await fetch(`https://api.github.com${path}`, {
        ...options,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`GitHub API error: ${error}`);
      }

      const data = await response.json();
      setCachedResponse(cacheKey, data);
      return data;
    },
  };
}
