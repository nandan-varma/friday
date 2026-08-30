import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  fetchGoogleCalendars,
  isGoogleCalendarConnected,
  updateSelectedCalendars,
} from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";

const log = createLogger("api/calendars");

// GET /api/calendars - Fetch user's Google calendars
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isGoogleCalendarConnected(session.user.id))) {
    log.info("calendar not connected", { userId: session.user.id });
    return Response.json({ error: "Google Calendar not connected" }, { status: 400 });
  }

  try {
    const calendars = await fetchGoogleCalendars(session.user.id);
    return Response.json(calendars);
  } catch (error) {
    log.error("failed to fetch calendars", { userId: session.user.id, error });
    return Response.json({ error: "Failed to fetch calendars" }, { status: 500 });
  }
}

// PATCH /api/calendars - Update selected calendar IDs for sync
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { calendarIds } = await request.json();
  if (!Array.isArray(calendarIds)) {
    return Response.json({ error: "calendarIds must be an array" }, { status: 400 });
  }

  await updateSelectedCalendars(session.user.id, calendarIds);
  log.info("updated selected calendars", { userId: session.user.id, count: calendarIds.length });
  return Response.json({ success: true, selectedCalendarIds: calendarIds });
}
