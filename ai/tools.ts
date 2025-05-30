import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getUpcomingEventsTool = createTool({
  description: 'Get upcoming events for the user',
  parameters: z.object({
    limit: z.number().optional().describe('Number of events to fetch (default: 5)'),
    days: z.number().optional().describe('Number of days to look ahead (default: 7)'),
  }),
  execute: async function ({ limit = 5, days = 7 }) {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      // Call your actual API endpoint
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const url = new URL('/api/events', baseUrl);
      url.searchParams.set('start', startDate.toISOString());
      url.searchParams.set('end', endDate.toISOString());
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return {
            events: [],
            count: 0,
            error: 'Please log in to view your events',
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const events = await response.json();
      
      // Format events for the UI
      const formattedEvents = events.slice(0, limit).map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        location: event.location,
        startTime: event.startTime,
        endTime: event.endTime,
        isAllDay: event.isAllDay,
      }));
      
      return {
        events: formattedEvents,
        count: events.length,
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return {
        events: [],
        count: 0,
        error: 'Failed to fetch events. Please try again.',
      };
    }
  },
});

export const createEventTool = createTool({
  description: 'Create a new calendar event',
  parameters: z.object({
    title: z.string().describe('Event title'),
    description: z.string().optional().describe('Event description'),
    location: z.string().optional().describe('Event location'),
    startTime: z.string().describe('Event start time in ISO format'),
    endTime: z.string().describe('Event end time in ISO format'),
    isAllDay: z.boolean().optional().describe('Whether the event is all day'),
  }),
  execute: async function ({ title, description, location, startTime, endTime, isAllDay = false }) {
    try {
      // Call your actual API endpoint to create the event
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          location,
          startTime,
          endTime,
          isAllDay,
          recurrence: 'none',
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: 'Please log in to create events',
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const event = await response.json();
      
      return {
        success: true,
        event: {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          isAllDay: event.isAllDay,
        },
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event. Please try again.',
      };
    }
  },
});

export const suggestEventTimeTool = createTool({
  description: 'Suggest available time slots for an event',
  parameters: z.object({
    duration: z.number().describe('Event duration in minutes'),
    preferredDate: z.string().optional().describe('Preferred date in YYYY-MM-DD format'),
    timePreference: z.enum(['morning', 'afternoon', 'evening', 'any']).optional().describe('Preferred time of day'),
  }),
  execute: async function ({ duration, preferredDate, timePreference = 'any' }) {
    try {
      // Calculate date range for the request
      const startDate = preferredDate ? new Date(preferredDate) : new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7); // Look ahead 7 days
      
      // Call your actual AI suggest-time API endpoint
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/ai/suggest-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          duration,
          preferences: `Prefer ${timePreference} times`,
          dateRange: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return {
            suggestions: [],
            error: 'Please log in to get time suggestions',
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const suggestions = await response.json();
      
      // Transform the API response to match our UI component format
      const formattedSuggestions = Array.isArray(suggestions) ? suggestions.map((suggestion: any) => {
        // Convert date + time format to ISO string
        const startTime = new Date(`${suggestion.date}T${suggestion.startTime}`);
        const endTime = new Date(`${suggestion.date}T${suggestion.endTime}`);
        
        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          score: 0.8, // Default score since API doesn't provide it
        };
      }) : [];
      
      return {
        suggestions: formattedSuggestions,
        preferredDate,
        duration,
      };
    } catch (error) {
      console.error('Error suggesting times:', error);
      
      // Fallback to generating basic suggestions if API fails
      const baseDate = preferredDate ? new Date(preferredDate) : new Date();
      baseDate.setDate(baseDate.getDate() + 1); // Tomorrow
      
      const fallbackSuggestions = [];
      
      // Generate basic time slots based on preference
      const timeSlots = [];
      if (timePreference === 'morning' || timePreference === 'any') {
        timeSlots.push({ hour: 9, score: 0.9 });
      }
      if (timePreference === 'afternoon' || timePreference === 'any') {
        timeSlots.push({ hour: 14, score: 0.8 });
      }
      if (timePreference === 'evening' || timePreference === 'any') {
        timeSlots.push({ hour: 17, score: 0.7 });
      }
      
      for (const slot of timeSlots) {
        const startTime = new Date(baseDate);
        startTime.setHours(slot.hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + duration);
        
        fallbackSuggestions.push({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          score: slot.score,
        });
      }
      
      return {
        suggestions: fallbackSuggestions,
        preferredDate,
        duration,
        error: 'Using basic suggestions due to API error',
      };
    }
  },
});

export const createMultipleEventsTool = createTool({
  description: 'Create multiple calendar events at once',
  parameters: z.object({
    events: z.array(z.object({
      title: z.string().describe('Event title'),
      description: z.string().optional().describe('Event description'),
      location: z.string().optional().describe('Event location'),
      startTime: z.string().describe('Event start time in ISO format'),
      endTime: z.string().describe('Event end time in ISO format'),
      isAllDay: z.boolean().optional().describe('Whether the event is all day'),
    })).describe('Array of events to create'),
  }),
  execute: async function ({ events }) {
    const results = [];
    const errors = [];
    
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      
      // Create events one by one
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        try {
          const response = await fetch(`${baseUrl}/api/events`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: event.title,
              description: event.description,
              location: event.location,
              startTime: event.startTime,
              endTime: event.endTime,
              isAllDay: event.isAllDay || false,
              recurrence: 'none',
            }),
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              errors.push(`Failed to create "${event.title}": Please log in to create events`);
              continue;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const createdEvent = await response.json();
          results.push({
            id: createdEvent.id,
            title: createdEvent.title,
            description: createdEvent.description,
            location: createdEvent.location,
            startTime: createdEvent.startTime,
            endTime: createdEvent.endTime,
            isAllDay: createdEvent.isAllDay,
          });
        } catch (error) {
          console.error(`Error creating event "${event.title}":`, error);
          errors.push(`Failed to create "${event.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return {
        success: results.length > 0,
        events: results,
        errors: errors.length > 0 ? errors : undefined,
        totalAttempted: events.length,
      };
    } catch (error) {
      console.error('Error in createMultipleEvents:', error);
      return {
        success: false,
        events: [],
        errors: [`Failed to create events: ${error instanceof Error ? error.message : 'Unknown error'}`],
        totalAttempted: events.length,
      };
    }
  },
});

export const tools = {
  getUpcomingEvents: getUpcomingEventsTool,
  createEvent: createEventTool,
  suggestEventTime: suggestEventTimeTool,
  createMultipleEvents: createMultipleEventsTool,
};
