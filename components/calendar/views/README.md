# Calendar Views

This directory contains modular, polished calendar view components that provide a clean and maintainable structure for displaying calendar data.

## Structure

```
components/calendar/views/
├── index.ts                 # Barrel exports
├── types.ts                 # Shared types and interfaces
├── calendar-header.tsx      # Reusable header component
├── event-card.tsx          # Reusable event display component
├── month-view.tsx          # Month calendar view
├── week-view.tsx           # Week calendar view  
├── day-view.tsx            # Day calendar view
└── agenda-view.tsx         # Agenda/list view
```

## Components

### CalendarHeader
Reusable header component with navigation controls and title display.

**Props:**
- `title: string` - The display title
- `onPrevious: () => void` - Previous period handler
- `onNext: () => void` - Next period handler
- `onToday: () => void` - Today button handler
- `showTodayButton?: boolean` - Whether to show the today button
- `className?: string` - Additional CSS classes

### EventCard
Flexible event display component with multiple variants.

**Props:**
- `event: CalendarEvent` - The event data
- `variant?: 'default' | 'compact' | 'minimal'` - Display variant
- `showTime?: boolean` - Whether to show event time
- `showLocation?: boolean` - Whether to show event location
- `showDescription?: boolean` - Whether to show event description
- `onClick?: (event: CalendarEvent) => void` - Click handler
- `className?: string` - Additional CSS classes

### Views

Each view component (`MonthView`, `WeekView`, `DayView`, `AgendaView`) implements the `CalendarViewProps` interface:

**Props:**
- `events: CalendarEvent[]` - Array of events to display
- `currentDate: Date` - Currently selected date
- `onDateChange: (date: Date) => void` - Date change handler
- `onEventClick?: (event: CalendarEvent) => void` - Event click handler
- `onCreateEvent?: (date: Date, hour?: number) => void` - Create event handler

## Features

### Enhanced Month View
- Clean grid layout with proper spacing
- Interactive day cells with hover effects
- Event overflow handling ("X more" indicator)
- Click-to-create functionality
- Today highlighting
- Current month vs. other month styling

### Improved Week View
- All-day events section
- Horizontal scrolling for mobile
- Time slot interactions
- Event positioning in time grid
- Today highlighting in header

### Polished Day View
- Summary card with event counts
- All-day events section
- Time-based scheduling grid
- Click-to-create with time pre-fill
- Interactive time slots

### Modern Agenda View
- Grouped by date with smart labeling (Today, Tomorrow)
- Event type badges
- Infinite scroll support
- Source identification (Google, Local)
- Empty state with call-to-action

## Usage

```tsx
import { MonthView, type CalendarEvent } from '@/components/calendar/views'

const events: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    startTime: '2025-05-29T10:00:00Z',
    endTime: '2025-05-29T11:00:00Z',
    isAllDay: false,
    description: 'Weekly team sync',
    location: 'Conference Room A',
    source: 'local'
  }
]

function MyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const handleEventClick = (event: CalendarEvent) => {
    // Handle event interaction
  }
  
  const handleCreateEvent = (date: Date, hour?: number) => {
    // Handle event creation
  }
  
  return (
    <MonthView
      events={events}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      onEventClick={handleEventClick}
      onCreateEvent={handleCreateEvent}
    />
  )
}
```

## Design Principles

### Modularity
Each view is a separate component that can be used independently or as part of the main calendar view.

### Consistency
All views use the shared `CalendarHeader` and `EventCard` components for consistent styling and behavior.

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

### Responsiveness
- Mobile-first design
- Horizontal scrolling where needed
- Adaptive layouts for different screen sizes
- Touch-friendly interactions

### Performance
- Efficient event filtering
- Minimal re-renders
- Optimized for large event datasets
- Lazy loading for agenda view

## Styling

Uses Tailwind CSS with the design system's color palette:
- Primary colors for today/current date highlighting
- Muted colors for inactive elements
- Accent colors for hover states
- Source-specific colors (blue for Google events)

## Integration

The views integrate seamlessly with:
- Google Calendar API
- Local event storage
- Event creation flows
- Navigation systems
- State management
