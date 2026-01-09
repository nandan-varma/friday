import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  exchangeCodeForTokens,
  getGithubUserInfo,
  storeIntegration,
} from "@/lib/github-oauth";
import { headers } from "next/headers";

// POST /api/integrations/github/callback - Handle OAuth callback
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    // Exchange code for tokens
    const { accessToken, refreshToken, tokenExpiry, scope } =
      await exchangeCodeForTokens(code);

    // Get GitHub user info
    const githubUser = await getGithubUserInfo(accessToken);

    // Store integration in database
    await storeIntegration(
      session.user.id,
      githubUser.githubUserId,
      githubUser.username,
      accessToken,
      refreshToken,
      tokenExpiry,
      scope
    );

    return NextResponse.json({
      success: true,
      githubUser: {
        username: githubUser.username,
        name: githubUser.name,
        email: githubUser.email,
      },
    });
  } catch (error) {
    console.error("Error handling GitHub OAuth callback:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to complete OAuth flow",
      },
      { status: 500 }
    );
  }
}
