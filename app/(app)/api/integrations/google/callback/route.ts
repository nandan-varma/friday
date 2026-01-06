import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
  storeIntegration,
} from "@/lib/google-oauth";
import { headers } from "next/headers";

// POST /api/integrations/google/callback - Handle OAuth callback
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
    const { accessToken, refreshToken, tokenExpiry } =
      await exchangeCodeForTokens(code);

    // Get Google user info
    const googleUser = await getGoogleUserInfo(accessToken);

    // Store integration in database
    await storeIntegration(
      session.user.id,
      googleUser.googleUserId,
      accessToken,
      refreshToken || undefined,
      tokenExpiry
    );

    return NextResponse.json({
      success: true,
      googleUser: {
        email: googleUser.email,
        name: googleUser.name,
      },
    });
  } catch (error) {
    console.error("Error handling Google OAuth callback:", error);
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
