import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { fetchGoogleCalendars, updateSelectedCalendars } from "@/lib/google-calendar";
import { getIntegration } from "@/lib/google-oauth";

// GET /api/calendars - Fetch user's Google calendars
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if Google Calendar is connected
    const integration = await getIntegration(session.user.id);
    
    if (!integration) {
      return Response.json({ error: "Google Calendar not connected" }, { status: 400 });
    }

    // Fetch calendars from Google
    const calendars = await fetchGoogleCalendars(session.user.id);

    return Response.json(calendars);
  } catch (error) {
    console.error("Failed to fetch calendars:", error);
    return Response.json({ error: "Failed to fetch calendars" }, { status: 500 });
  }
}

// PATCH /api/calendars - Update selected calendar IDs for sync
export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { calendarIds } = body;

    if (!Array.isArray(calendarIds)) {
      return Response.json({ error: "calendarIds must be an array" }, { status: 400 });
    }

    await updateSelectedCalendars(session.user.id, calendarIds);

    return Response.json({ success: true, selectedCalendarIds: calendarIds });
  } catch (error) {
    console.error("Failed to update selected calendars:", error);
    return Response.json({ error: "Failed to update selected calendars" }, { status: 500 });
  }
}

