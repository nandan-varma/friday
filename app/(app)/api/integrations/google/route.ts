import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  storeIntegration,
  getIntegration,
  revokeIntegration,
} from "@/lib/google-oauth";
import { headers } from "next/headers";

// POST /api/integrations/google - Initiate OAuth flow
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(session.user.id);

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error initiating Google OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}

// GET /api/integrations/google - Get integration status
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await getIntegration(session.user.id);

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      googleUserId: integration.googleUserId,
      lastSyncAt: integration.lastSyncAt,
      selectedCalendarIds: integration.selectedCalendarIds
        ? JSON.parse(integration.selectedCalendarIds)
        : [],
    });
  } catch (error) {
    console.error("Error fetching integration status:", error);
    return NextResponse.json(
      { error: "Failed to fetch integration status" },
      { status: 500 }
    );
  }
}

// DELETE /api/integrations/google - Disconnect integration
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await revokeIntegration(session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting Google Calendar:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
