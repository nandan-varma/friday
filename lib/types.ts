import { CoreMessage } from 'ai'

export type Message = CoreMessage & {
  id: string
}

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export interface Session {
  user: {
    id: string
    email: string
  }
}

export interface AuthResult {
  type: string
  message: string
}

export interface User extends Record<string, any> {
  id: string
  email: string
  password: string
  salt: string
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  color?: string;
}

export interface DragState {
  startDate: Date | null;
  endDate: Date | null;
  isDragging: boolean;
  draggedEventId?: string;
}

export type TimeSlot = {
  hour: number;
  minute: number;
};

export const TIME_SLOTS: TimeSlot[] = Array.from({ length: 24 * 2 }, (_, i) => ({
  hour: Math.floor(i / 2),
  minute: (i % 2) * 30,
}));