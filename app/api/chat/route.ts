import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getUserFromCookie } from '@/lib/auth';
import { EventService } from '@/services/eventService';
import { tool as createTool } from 'ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { messages } = await request.json();
  
  // Get user for server-side tools
  const user = await getUserFromCookie();
  
  // Create server-side tools that have access to the user context
  const serverTools = {
    getUpcomingEvents: createTool({
      description: 'Get upcoming events for the user',
      parameters: z.object({
        limit: z.number().optional().describe('Number of events to fetch (default: 5)'),
        days: z.number().optional().describe('Number of days to look ahead (default: 7)'),
      }),
      execute: async function ({ limit = 5, days = 7 }) {
        if (!user) {
          return {
            events: [],
            count: 0,
            error: 'Please log in to view your events',
          };
        }        try {
          const userEvents = await EventService.getAllUpcomingEvents(user.id, days, limit);

          const formattedEvents = userEvents.map((event) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            isAllDay: event.isAllDay ?? false,
          }));

          return {
            events: formattedEvents,
            count: userEvents.length,
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
    }),

    createEvent: createTool({
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
        if (!user) {
          return {
            success: false,
            error: 'Please log in to create events',
          };
        }        try {
          const newEvent = await EventService.createEvent(user.id, {
            title,
            description,
            location,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            isAllDay,
            recurrence: 'none',
          });

          return {
            success: true,
            event: {
              id: newEvent.id,
              title: newEvent.title,
              description: newEvent.description,
              location: newEvent.location,
              startTime: newEvent.startTime.toISOString(),
              endTime: newEvent.endTime.toISOString(),
              isAllDay: newEvent.isAllDay ?? false,
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
    }),

    suggestEventTime: createTool({
      description: 'Suggest available time slots for an event',
      parameters: z.object({
        duration: z.number().describe('Event duration in minutes'),
        preferredDate: z.string().optional().describe('Preferred date in YYYY-MM-DD format'),
        timePreference: z.enum(['morning', 'afternoon', 'evening', 'any']).optional().describe('Preferred time of day'),
      }),
      execute: async function ({ duration, preferredDate, timePreference = 'any' }) {
        if (!user) {
          return {
            suggestions: [],
            error: 'Please log in to get time suggestions',
          };
        }

        try {
          // Determine the date to check
          const targetDate = preferredDate ? new Date(preferredDate) : new Date();
          if (targetDate < new Date()) {
            targetDate.setDate(new Date().getDate() + 1); // Default to tomorrow if date is in the past
          }

          // Get existing events for the target date
          const startOfDay = new Date(targetDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(targetDate);
          endOfDay.setHours(23, 59, 59, 999);          
          const existingEvents = await EventService.getAllEventsInRange(
            user.id,
            startOfDay,
            endOfDay
          );

          // Generate time suggestions
          const suggestions = generateTimeSuggestions(
            targetDate,
            duration,
            timePreference,
            existingEvents
          );

          return {
            suggestions,
            preferredDate: targetDate.toISOString().split('T')[0],
            duration,
          };
        } catch (error) {
          console.error('Error suggesting times:', error);
          return {
            suggestions: [],
            error: 'Failed to suggest times. Please try again.',
          };
        }
      },
    }),
  };
  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful AI calendar assistant for Friday, a smart calendar application. 
    
    Your role is to help users manage their calendar, schedule events, find available time slots, and provide calendar-related assistance.
    
    Key capabilities:
    - Show upcoming events using getUpcomingEvents
    - Create new calendar events using createEvent
    - Suggest available time slots using suggestEventTime
    - Help with scheduling conflicts
    - Provide calendar insights
    
    Today's date is ${new Date().toLocaleDateString()}.
    Current user: ${user ? `${user.name || user.email}` : 'Not logged in'}
    
    When users ask about their schedule or events:
    - Use the getUpcomingEvents tool to show their current events
    - Be specific about dates and times
    - Offer to help create new events if their calendar is empty
    
    When users want to create events:
    - Use the createEvent tool to add events to their calendar
    - Ask for necessary details if missing (title, date, time)
    - Confirm event creation with details
    - For times, if they say something like "tomorrow at 2pm", convert it to proper ISO format
    
    When users need help finding time:
    - Use the suggestEventTime tool to find available slots
    - Consider their preferences for time of day
    - Suggest reasonable durations based on event type
    
    Be conversational, helpful, and proactive in offering calendar assistance.
    If user is not logged in, politely ask them to log in first.`,
    messages,
    maxSteps: 5,
    tools: serverTools,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error: unknown) => {
      console.error('Chat API Error:', error);
      
      if (error == null) {
        return 'Unknown error occurred';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}

function generateTimeSuggestions(
  date: Date,
  duration: number,
  timePreference: string,
  existingEvents: any[]
) {
  const suggestions = [];
  const targetDate = new Date(date);
  
  // Define time slots based on preference
  const timeSlots = [];
  
  if (timePreference === 'morning' || timePreference === 'any') {
    timeSlots.push(
      { hour: 9, minute: 0, label: 'morning' },
      { hour: 10, minute: 0, label: 'morning' },
      { hour: 11, minute: 0, label: 'morning' }
    );
  }
  
  if (timePreference === 'afternoon' || timePreference === 'any') {
    timeSlots.push(
      { hour: 13, minute: 0, label: 'afternoon' },
      { hour: 14, minute: 0, label: 'afternoon' },
      { hour: 15, minute: 0, label: 'afternoon' },
      { hour: 16, minute: 0, label: 'afternoon' }
    );
  }
  
  if (timePreference === 'evening' || timePreference === 'any') {
    timeSlots.push(
      { hour: 17, minute: 0, label: 'evening' },
      { hour: 18, minute: 0, label: 'evening' },
      { hour: 19, minute: 0, label: 'evening' }
    );
  }

  for (const slot of timeSlots) {
    const startTime = new Date(targetDate);
    startTime.setHours(slot.hour, slot.minute, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    // Check if this time conflicts with existing events
    const hasConflict = existingEvents.some(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      
      return (
        (startTime >= eventStart && startTime < eventEnd) ||
        (endTime > eventStart && endTime <= eventEnd) ||
        (startTime <= eventStart && endTime >= eventEnd)
      );
    });
    
    if (!hasConflict) {
      // Calculate score based on time preference and other factors
      let score = 0.7; // Base score
      
      if (slot.label === timePreference) {
        score += 0.2;
      }
      
      // Prefer earlier times in the day
      if (slot.hour < 12) {
        score += 0.1;
      }
      
      suggestions.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        score: Math.min(score, 1.0)
      });
    }
  }
  
  // Sort by score (highest first) and limit to top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
