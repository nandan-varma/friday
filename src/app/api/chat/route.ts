 import { openai } from '@ai-sdk/openai';
 import { streamText, convertToModelMessages, UIMessage } from 'ai';
 import { z } from 'zod';
 import { auth } from '@/lib/auth';
 import { headers } from 'next/headers';
 import EventService from '@/lib/eventService';

 // Allow streaming responses up to 30 seconds
 export const maxDuration = 30;

 export async function POST(request: Request) {
   const { messages }: { messages: UIMessage[] } = await request.json();

   // Get user for context
   const session = await auth.api.getSession({
     headers: await headers()
   });
   const user = session?.user;

   if (!user?.id) {
     return new Response('User not authenticated', { status: 401 });
   }

  const result = streamText({
    model: openai('gpt-4o'),
    system: `You are a helpful AI calendar assistant for Friday, a smart calendar application.

    Your role is to help users manage their calendar, schedule events, find available time slots, and provide calendar-related assistance.

    Today's date is ${new Date().toLocaleDateString()}.
    Current user: ${user ? `${user.name || user.email}` : 'Not logged in'}

    IMPORTANT: When using tools, do NOT repeat or restate the tool results in your text response. The tool results are already displayed in the UI, so focus on providing additional context, explanations, or asking follow-up questions. For example:
    - If showing events: Don't list them again, instead say "Here are your upcoming events" or "I found X events for you"
    - If creating an event: Don't repeat the event details, instead confirm "I've created the event for you" or ask "Would you like to add any additional details?"
    - If showing statistics: Don't repeat the numbers, instead say "Here's an overview of your calendar activity"

    Be conversational and helpful. Use the available tools to help users with their calendar needs.`,
     messages: convertToModelMessages(messages),
     tools: {
       // Get upcoming events
       getUpcomingEvents: {
         description: 'Get upcoming events from the user\'s calendar',
         inputSchema: z.object({
           days: z.number().optional().describe('Number of days to look ahead (default: 7)'),
           limit: z.number().optional().describe('Maximum number of events to return'),
         }),
         execute: async ({ days = 7, limit }: { days?: number; limit?: number }) => {
           try {
             const events = await EventService.getAllUpcomingEvents(user.id, days, limit);
             return events.map(event => ({
               id: event.id,
               title: event.title,
               description: event.description,
               location: event.location,
               startTime: event.startTime.toISOString(),
               endTime: event.endTime.toISOString(),
               isAllDay: event.isAllDay,
               origin: event.origin,
             }));
           } catch (error) {
             console.error('Error getting upcoming events:', error);
             throw new Error('Failed to fetch upcoming events');
           }
         },
       },
       // Get today's events
       getTodayEvents: {
         description: 'Get events scheduled for today',
         inputSchema: z.object({}),
         execute: async () => {
           try {
             const events = await EventService.getAllTodayEvents(user.id);
             return events.map(event => ({
               id: event.id,
               title: event.title,
               description: event.description,
               location: event.location,
               startTime: event.startTime.toISOString(),
               endTime: event.endTime.toISOString(),
               isAllDay: event.isAllDay,
               origin: event.origin,
             }));
           } catch (error) {
             console.error('Error getting today\'s events:', error);
             throw new Error('Failed to fetch today\'s events');
           }
         },
       },
       // Create event from natural language
       createEvent: {
         description: 'Create a new calendar event from natural language description',
         inputSchema: z.object({
           description: z.string().describe('Natural language description of the event to create'),
         }),
         execute: async ({ description }: { description: string }) => {
           try {
             const event = await EventService.createEventFromNaturalLanguage(user.id, description);
             return {
               id: `local_${event.id}`,
               title: event.title,
               description: event.description,
               location: event.location,
               startTime: event.startTime.toISOString(),
               endTime: event.endTime.toISOString(),
               isAllDay: event.isAllDay,
               origin: 'local',
             };
           } catch (error) {
             console.error('Error creating event:', error);
             throw new Error('Failed to create event');
           }
         },
       },
       // Search events
       searchEvents: {
         description: 'Search for events containing specific text',
         inputSchema: z.object({
           query: z.string().describe('Search term to find in event titles, descriptions, or locations'),
           days: z.number().optional().describe('Number of days to search ahead (default: 30)'),
         }),
         execute: async ({ query, days = 30 }: { query: string; days?: number }) => {
           try {
             const events = await EventService.searchAllEvents(user.id, query, {
               startDate: new Date(),
               endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
             });
             return events.map(event => ({
               id: event.id,
               title: event.title,
               description: event.description,
               location: event.location,
               startTime: event.startTime.toISOString(),
               endTime: event.endTime.toISOString(),
               isAllDay: event.isAllDay,
               origin: event.origin,
             }));
           } catch (error) {
             console.error('Error searching events:', error);
             throw new Error('Failed to search events');
           }
         },
       },
       // Get event statistics
       getEventStats: {
         description: 'Get statistics about the user\'s calendar events',
         inputSchema: z.object({}),
         execute: async () => {
           try {
             const stats = await EventService.getEventStatistics(user.id);
             return stats;
           } catch (error) {
             console.error('Error getting event statistics:', error);
             throw new Error('Failed to get event statistics');
           }
         },
       },
     },
   });

   return result.toUIMessageStreamResponse({
    onError: (error) => {
      console.error('AI SDK error:', error);
      if (error == null) {
        return 'An unknown error occurred';
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


