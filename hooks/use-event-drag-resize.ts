import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import { addMinutes, differenceInMinutes, set, startOfDay } from "date-fns"

export type DragHandle = "move" | "resize-start" | "resize-end"

export interface EventPosition {
  top: number
  height: number
}

interface Gesture {
  handle: DragHandle
  startClientY: number
  originTop: number
  originHeight: number
  hasMoved: boolean
}

interface LivePosition extends EventPosition {
  /** Day the pointer is currently over, for cross-column moves; null = unchanged. */
  targetDate: Date | null
}

interface UseEventDragResizeOptions {
  start: Date
  end: Date
  hourHeight: number
  snapMinutes?: number
  minDurationMinutes?: number
  editable?: boolean
  /** Resolves the calendar date under a clientX, for cross-day moves in multi-column views. */
  getDateAtX?: (clientX: number) => Date | null
  onCommit: (start: Date, end: Date) => void
}

const minutesFromMidnight = (date: Date) => differenceInMinutes(date, startOfDay(date))

/**
 * Drives the pointer gesture for moving/resizing a timed event card.
 *
 * The previous implementation read `isDragging`/`isResizing`/`position`
 * React state from inside the mousemove/mouseup handlers - but those
 * handlers are created once (in the mousedown closure) and never
 * recreated, so they always saw the pre-drag state, not the live values.
 * That silently no-oped the commit on every drag and resize. This version
 * keeps the gesture's live values in refs (mutated in place, always
 * current) and only touches React state to drive the visual position.
 */
export function useEventDragResize({
  start,
  end,
  hourHeight,
  snapMinutes = 15,
  minDurationMinutes = 15,
  editable = true,
  getDateAtX,
  onCommit,
}: UseEventDragResizeOptions) {
  const toPosition = useCallback(
    (s: Date, e: Date): EventPosition => {
      const top = (minutesFromMidnight(s) / 60) * hourHeight
      const minHeight = (minDurationMinutes / 60) * hourHeight
      const height = Math.max(((minutesFromMidnight(e) - minutesFromMidnight(s)) / 60) * hourHeight, minHeight)
      return { top, height }
    },
    [hourHeight, minDurationMinutes]
  )

  const [position, setPosition] = useState<EventPosition>(() => toPosition(start, end))
  const [activeHandle, setActiveHandle] = useState<DragHandle | null>(null)

  const gestureRef = useRef<Gesture | null>(null)
  const liveRef = useRef<LivePosition>({ top: 0, height: 0, targetDate: null })

  // Sync the displayed position when the event's own data changes, but not
  // mid-gesture - that would fight the drag.
  useEffect(() => {
    if (!gestureRef.current) setPosition(toPosition(start, end))
  }, [start, end, toPosition])

  const handlePointerDown = useCallback(
    (e: React.MouseEvent, handle: DragHandle) => {
      if (!editable) return
      e.stopPropagation()

      const origin = { top: position.top, height: position.height }
      gestureRef.current = { handle, startClientY: e.clientY, originTop: origin.top, originHeight: origin.height, hasMoved: false }
      liveRef.current = { ...origin, targetDate: null }
      setActiveHandle(handle)

      const snapPx = (snapMinutes / 60) * hourHeight
      const minHeightPx = (minDurationMinutes / 60) * hourHeight

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const gesture = gestureRef.current
        if (!gesture) return

        const deltaY = moveEvent.clientY - gesture.startClientY
        if (Math.abs(deltaY) > 3) gesture.hasMoved = true

        if (gesture.handle === "move") {
          const top = Math.max(0, Math.round((gesture.originTop + deltaY) / snapPx) * snapPx)
          const targetDate = getDateAtX ? getDateAtX(moveEvent.clientX) : null
          liveRef.current = { top, height: gesture.originHeight, targetDate }
          setPosition({ top, height: gesture.originHeight })
        } else if (gesture.handle === "resize-start") {
          const top = Math.round((gesture.originTop + deltaY) / snapPx) * snapPx
          const height = Math.round((gesture.originHeight - deltaY) / snapPx) * snapPx
          if (height >= minHeightPx) {
            liveRef.current = { top, height, targetDate: null }
            setPosition({ top, height })
          }
        } else {
          const height = Math.max(Math.round((gesture.originHeight + deltaY) / snapPx) * snapPx, minHeightPx)
          liveRef.current = { top: gesture.originTop, height, targetDate: null }
          setPosition({ top: gesture.originTop, height })
        }
      }

      const handleMouseUp = () => {
        const gesture = gestureRef.current
        if (gesture?.hasMoved) {
          const { top, height, targetDate } = liveRef.current
          const dateBasis = targetDate ?? start
          const startTotalMinutes = (top / hourHeight) * 60
          const durationMinutes = (height / hourHeight) * 60

          const newStart = set(dateBasis, {
            hours: Math.floor(startTotalMinutes / 60),
            minutes: Math.round(startTotalMinutes % 60),
            seconds: 0,
            milliseconds: 0,
          })
          onCommit(newStart, addMinutes(newStart, durationMinutes))
        }

        gestureRef.current = null
        setActiveHandle(null)
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [editable, position, hourHeight, snapMinutes, minDurationMinutes, getDateAtX, start, onCommit]
  )

  return { position, activeHandle, handlePointerDown }
}
