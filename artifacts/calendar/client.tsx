import { Artifact } from '@/components/create-artifact';
import {
  CopyIcon,
  PlusIcon,
  RedoIcon,
  UndoIcon,
  CalendarIcon,
} from '@/components/icons';
import { CalendarView } from '@/components/calendar-view';
import { toast } from 'sonner';

interface CalendarEvent {
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  description?: string;
}

type Metadata = any;

export const calendarArtifact = new Artifact<'calendar', Metadata>({
  kind: 'calendar',
  description: 'Useful for creating and visualizing calendar schedules',
  initialize: async () => {},
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === 'calendar-delta') {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.content as string,
        isVisible: true,
        status: 'streaming',
      }));
    }
  },
  content: ({
    content,
    currentVersionIndex,
    isCurrentVersion,
    onSaveContent,
    status,
  }) => {
    let events: CalendarEvent[] = [];
    try {
      events = content ? JSON.parse(content) : [];
    } catch (e) {
      console.error('Failed to parse calendar data:', e);
    }

    return (
      <CalendarView 
        events={events}
        onEventsChange={(updatedEvents) => {
          onSaveContent(JSON.stringify(updatedEvents), true);
        }}
        readOnly={!isCurrentVersion}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        if (currentVersionIndex === 0) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        if (isCurrentVersion) {
          return true;
        }

        return false;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy calendar data',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Calendar data copied to clipboard!');
      },
    },
  ],
  toolbar: [
    {
      icon: <PlusIcon />,
      description: 'Add more events',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Please add more events to this calendar',
        });
      },
    },
    {
      icon: <CalendarIcon />,
      description: 'Optimize schedule',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Can you optimize this schedule to make it more efficient?',
        });
      },
    },
  ],
});
