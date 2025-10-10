import { NextRequest, NextResponse } from "next/server";
import { GoogleIntegrationService } from "@/lib/services/googleIntegrationService";
import { auth } from "@/lib/auth";
import logger from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code, state } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    // Exchange code for tokens and save to database
    await GoogleIntegrationService.exchangeCodeForTokens(code, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Error in Google OAuth callback");
    return NextResponse.json(
      { error: "Failed to connect Google Calendar" },
      { status: 500 }
    );
  }
}
