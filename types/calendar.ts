// Calendar types for the application

export interface Calendar {
  id: string;
  name: string;
  color: string;
  checked: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  calendarId: string;
  color: string;
  location?: string;
  attendees?: string[];
  htmlLink?: string;
  editable?: boolean;
  /** All-day (or multi-day) event with no specific time-of-day. */
  allDay?: boolean;
  /** Present when this is one instance of a recurring series (Google's `recurringEventId`). */
  recurringEventId?: string;
}
