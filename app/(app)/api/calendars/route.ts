import { headers } from "next/headers";
import { parseJsonBody } from "@/lib/api";
import { auth } from "@/lib/auth";
import {
  fetchGoogleCalendars,
  isGoogleCalendarConnected,
  updateSelectedCalendars,
} from "@/lib/integrations/google/google-calendar";
import { createLogger } from "@/lib/logger";
import {
  calendarSelectionSchema,
  type GoogleCalendarResponse,
} from "@/lib/schemas/calendar";

const log = createLogger("api/calendars");

function toCalendarResponse(
  calendars: Awaited<ReturnType<typeof fetchGoogleCalendars>>,
): GoogleCalendarResponse[] {
  return calendars.flatMap((calendar) =>
    calendar.id
      ? [
          {
            id: calendar.id,
            summary: calendar.summary ?? "Untitled Calendar",
            description: calendar.description ?? undefined,
            primary: calendar.primary ?? undefined,
            accessRole: calendar.accessRole ?? undefined,
            backgroundColor: calendar.backgroundColor ?? undefined,
          },
        ]
      : [],
  );
}

// GET /api/calendars - Fetch user's Google calendars
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isGoogleCalendarConnected(session.user.id))) {
    log.info("calendar not connected", { userId: session.user.id });
    return Response.json(
      { error: "Google Calendar not connected" },
      { status: 400 },
    );
  }

  try {
    const calendars = await fetchGoogleCalendars(session.user.id);
    return Response.json(toCalendarResponse(calendars));
  } catch (error) {
    log.error("failed to fetch calendars", { userId: session.user.id, error });
    return Response.json(
      { error: "Failed to fetch calendars" },
      { status: 500 },
    );
  }
}

// PATCH /api/calendars - Update selected calendar IDs for sync
export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    log.warn("unauthorized request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody(request, calendarSelectionSchema);
  if (parsed.error) return parsed.error;
  const { calendarIds } = parsed.data;

  const availableCalendarIds = new Set(
    (await fetchGoogleCalendars(session.user.id)).flatMap((calendar) =>
      calendar.id ? [calendar.id] : [],
    ),
  );
  if (calendarIds.some((calendarId) => !availableCalendarIds.has(calendarId))) {
    return Response.json(
      { error: "One or more calendar IDs are unavailable" },
      { status: 400 },
    );
  }

  await updateSelectedCalendars(session.user.id, calendarIds);
  log.info("updated selected calendars", {
    userId: session.user.id,
    count: calendarIds.length,
  });
  return Response.json({ success: true, selectedCalendarIds: calendarIds });
}
