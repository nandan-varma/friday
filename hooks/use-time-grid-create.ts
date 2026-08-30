import { addMinutes, set } from "date-fns";
import type React from "react";
import { useCallback, useRef, useState } from "react";

interface TimeGridDrag {
  columnIndex: number;
  startY: number;
  currentY: number;
}

interface TimeGridPreview {
  columnIndex: number;
  top: number;
  height: number;
}

interface UseTimeGridCreateOptions {
  /** Pixel height of one hour row. */
  hourHeight: number;
  /** Snap increment in minutes. */
  snapMinutes?: number;
  /** One date per column, in display order (day view passes a single date). */
  columns: Date[];
  /** Element whose top edge is 00:00 and whose full height spans 24 hours. */
  containerRef: React.RefObject<HTMLElement | null>;
  onCreate: (start: Date, end: Date) => void;
}

const minutesToPixels = (minutes: number, hourHeight: number) =>
  (minutes / 60) * hourHeight;
const pixelsToMinutes = (pixels: number, hourHeight: number) =>
  (pixels / hourHeight) * 60;

/**
 * Click-and-drag-to-create logic shared by DayView and WeekView. A column
 * owns its own mousedown (so it knows its own index); this hook owns the
 * document-level move/up listeners so the drag keeps tracking even if the
 * pointer leaves the grid.
 */
export function useTimeGridCreate({
  hourHeight,
  snapMinutes = 15,
  columns,
  containerRef,
  onCreate,
}: UseTimeGridCreateOptions) {
  const [drag, setDrag] = useState<TimeGridDrag | null>(null);
  const dragRef = useRef<TimeGridDrag | null>(null);

  const relativeY = useCallback(
    (clientY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      return rect ? clientY - rect.top : 0;
    },
    [containerRef],
  );

  const snapMinuteValue = useCallback(
    (rawMinutes: number) => Math.round(rawMinutes / snapMinutes) * snapMinutes,
    [snapMinutes],
  );

  const commit = useCallback(
    (current: TimeGridDrag) => {
      const day = columns[current.columnIndex];
      if (!day) return;

      const startMinutes = snapMinuteValue(
        pixelsToMinutes(Math.min(current.startY, current.currentY), hourHeight),
      );
      const endMinutes = snapMinuteValue(
        pixelsToMinutes(Math.max(current.startY, current.currentY), hourHeight),
      );
      if (endMinutes <= startMinutes) return;

      const start = set(day, {
        hours: Math.floor(startMinutes / 60),
        minutes: startMinutes % 60,
        seconds: 0,
        milliseconds: 0,
      });
      onCreate(start, addMinutes(start, endMinutes - startMinutes));
    },
    [columns, hourHeight, onCreate, snapMinuteValue],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, columnIndex: number) => {
      if ((e.target as HTMLElement).closest("[data-event]")) return;

      const initial: TimeGridDrag = {
        columnIndex,
        startY: relativeY(e.clientY),
        currentY: relativeY(e.clientY),
      };
      dragRef.current = initial;
      setDrag(initial);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!dragRef.current) return;
        const next = {
          ...dragRef.current,
          currentY: relativeY(moveEvent.clientY),
        };
        dragRef.current = next;
        setDrag(next);
      };

      const handleMouseUp = () => {
        if (dragRef.current) commit(dragRef.current);
        dragRef.current = null;
        setDrag(null);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [commit, relativeY],
  );

  const cancel = useCallback(() => {
    dragRef.current = null;
    setDrag(null);
  }, []);

  const preview: TimeGridPreview | null = drag
    ? (() => {
        const startMinutes = snapMinuteValue(
          pixelsToMinutes(Math.min(drag.startY, drag.currentY), hourHeight),
        );
        const endMinutes = snapMinuteValue(
          pixelsToMinutes(Math.max(drag.startY, drag.currentY), hourHeight),
        );
        return {
          columnIndex: drag.columnIndex,
          top: minutesToPixels(startMinutes, hourHeight),
          height: Math.max(
            minutesToPixels(endMinutes - startMinutes, hourHeight),
            hourHeight / 4,
          ),
        };
      })()
    : null;

  return { preview, handleMouseDown, cancel };
}
