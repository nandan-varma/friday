"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { Event } from "@/db/schema/calendar";

interface EventContextMenuProps {
  event: Event;
  children: React.ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}

export function EventContextMenu({
  event,
  children,
  onEdit,
  onDelete,
  onDuplicate,
}: EventContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onEdit}>Edit Event</ContextMenuItem>
        {onDuplicate && (
          <ContextMenuItem onClick={onDuplicate}>Duplicate Event</ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onDelete} className="text-destructive">
          Delete Event
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
