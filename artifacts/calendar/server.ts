import { z } from 'zod';
import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { calendarPrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const calendarDocumentHandler = createDocumentHandler<'calendar'>({
  kind: 'calendar',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: calendarPrompt,
      prompt: title,
      schema: z.object({
        events: z.array(
          z.object({
            title: z.string(),
            start: z.string(),
            end: z.string(),
            allDay: z.boolean().optional(),
            description: z.string().optional(),
          })
        ),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { events } = object;

        if (events) {
          const content = JSON.stringify(events);
          dataStream.writeData({
            type: 'calendar-delta',
            content,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { fullStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: updateDocumentPrompt(document.content, 'calendar'),
      prompt: description,
      schema: z.object({
        events: z.array(
          z.object({
            title: z.string(),
            start: z.string(),
            end: z.string(),
            allDay: z.boolean().optional(),
            description: z.string().optional(),
          })
        ),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { events } = object;

        if (events) {
          const content = JSON.stringify(events);
          dataStream.writeData({
            type: 'calendar-delta',
            content,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});