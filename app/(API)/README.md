# Events API Documentation

Simple REST API for event management with local and Google Calendar integration.

## Base URL
```
/api
```

## Authentication
All endpoints require user authentication via session.

---

## Events Endpoint

### GET `/api/events`
Retrieve events with various filtering options using query parameters.

**Query Parameters:**
- `type` - Event retrieval type:
  - `all` (default) - All events
  - `today` - Today's events only
  - `upcoming` - Upcoming events
  - `range` - Events in date range
  - `search` - Search events
  - `statistics` - Event statistics
- `includeLocal` (boolean, default: true) - Include local events
- `includeGoogle` (boolean, default: true) - Include Google events
- `calendarId` (string) - Specific Google Calendar ID

**Type-specific Parameters:**
- For `upcoming`: `days` (number, default: 7), `limit` (number)
- For `range`: `startDate` (ISO string, required), `endDate` (ISO string, required)
- For `search`: `q` (string, required) - Search term

**Examples:**
```bash
# Get all events
GET /api/events

# Get today's events
GET /api/events?type=today

# Get upcoming events (next 14 days, limit 10)
GET /api/events?type=upcoming&days=14&limit=10

# Get events in date range
GET /api/events?type=range&startDate=2025-06-01&endDate=2025-06-30

# Search events
GET /api/events?type=search&q=meeting

# Get statistics
GET /api/events?type=statistics
```

**Response:**
```json
{
  "events": [...] // For event queries
}
// OR
{
  "statistics": {
    "totalEvents": 45,
    "localEvents": 20,
    "googleEvents": 25,
    "todayEvents": 3,
    "upcomingEvents": 12,
    "allDayEvents": 5,
    "recurringEvents": 8
  }
}
```

### POST `/api/events`
Create a new event using natural language or structured data.

**Request Body (Natural Language):**
```json
{
  "input": "Schedule team meeting tomorrow at 2pm for 1 hour"
}
```

**Request Body (Structured):**
```json
{
  "eventData": {
    "title": "Team Meeting",
    "description": "Weekly sync",
    "location": "Conference Room",
    "startTime": "2025-06-19T14:00:00Z",
    "endTime": "2025-06-19T15:00:00Z",
    "isAllDay": false,
    "recurrence": "weekly"
  },
  "options": {
    "preferredOrigin": "local",
    "calendarId": "primary"
  }
}
```

### PUT `/api/events`
Update an existing event.

**Request Body:**
```json
{
  "eventData": {
    "title": "Updated Meeting",
    "startTime": "2025-06-19T15:00:00Z",
    "endTime": "2025-06-19T16:00:00Z"
  },
  "options": {
    "eventId": "local_123",
    "calendarId": "primary"
  }
}
```

### DELETE `/api/events`
Delete an event.

**Query Parameters:**
- `eventId` (string, required) - Event ID to delete
- `calendarId` (string) - Calendar ID for Google events

**Example:**
```bash
DELETE /api/events?eventId=local_123
```

---

## Integrations Endpoint

### GET `/api/integrations`
Get calendar integration status.

**Response:**
```json
{
  "status": {
    "hasLocalEvents": true,
    "hasGoogleIntegration": true,
    "totalIntegrations": 2
  }
}
```

---

## Event Object Schema

```typescript
interface UnifiedEvent {
  id: string              // Format: "local_123" or "google_abc"
  title: string
  description?: string
  location?: string
  startTime: Date
  endTime: Date
  isAllDay: boolean
  recurrence?: "none" | "daily" | "weekly" | "monthly" | "yearly"
  origin: "local" | "google"
  originalId?: string | number
  googleEventId?: string
  attendees?: Array<{
    email?: string
    displayName?: string
    responseStatus?: string
  }>
  createdAt?: Date
  updatedAt?: Date
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `500` - Internal Server Error

## Notes
- All dates should be in ISO 8601 format
- Event IDs are prefixed: `local_` or `google_`
- Natural language creation uses AI processing
