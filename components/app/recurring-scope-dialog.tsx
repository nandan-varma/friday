"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export type RecurringEditScope = "instance" | "series";

interface RecurringScopeDialogProps {
  open: boolean;
  action: "save" | "delete" | "move" | "resize";
  onOpenChange: (open: boolean) => void;
  onChoose: (scope: RecurringEditScope) => void;
}

const ACTION_COPY: Record<
  RecurringScopeDialogProps["action"],
  { title: string; verb: string }
> = {
  save: { title: "Edit recurring event", verb: "change" },
  delete: { title: "Delete recurring event", verb: "deletion" },
  move: { title: "Move recurring event", verb: "move" },
  resize: { title: "Resize recurring event", verb: "change" },
};

export function RecurringScopeDialog({
  open,
  action,
  onOpenChange,
  onChoose,
}: RecurringScopeDialogProps) {
  const { title, verb } = ACTION_COPY[action];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            This is part of a recurring series. Apply this {verb} to just this
            event, or to every event in the series?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="outline" onClick={() => onChoose("instance")}>
            This event
          </Button>
          <AlertDialogAction onClick={() => onChoose("series")}>
            All events
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
