// Greedy interval-scheduling row packer used to lay out all-day/multi-day
// event bars so overlapping spans stack into separate rows instead of
// colliding.

export interface AllDaySpan<T> {
  item: T;
  /** Inclusive start column index. */
  startIdx: number;
  /** Inclusive end column index. */
  endIdx: number;
}

export function packAllDaySpans<T>(spans: AllDaySpan<T>[]): AllDaySpan<T>[][] {
  const sorted = [...spans].sort((a, b) => a.startIdx - b.startIdx);
  const rows: AllDaySpan<T>[][] = [];

  for (const span of sorted) {
    const row = rows.find((existingRow) =>
      existingRow.every(
        (other) => other.endIdx < span.startIdx || other.startIdx > span.endIdx,
      ),
    );
    if (row) {
      row.push(span);
    } else {
      rows.push([span]);
    }
  }

  return rows;
}

export interface TimedEvent {
  id: string;
  start: Date;
  end: Date;
}

export interface EventLayout {
  /** Left offset, as a percentage of the day column's width. */
  left: number;
  /** Width, as a percentage of the day column's width. */
  width: number;
}

/**
 * Lays out same-day overlapping timed events side by side (Google
 * Calendar-style) instead of letting them all claim the full column width.
 * Overlapping events are grouped into clusters, packed into the fewest
 * columns needed within each cluster, then each event expands rightward to
 * fill any columns that stay empty for its whole duration.
 */
export function layoutOverlappingEvents(
  events: TimedEvent[],
): Map<string, EventLayout> {
  const layout = new Map<string, EventLayout>();
  if (events.length === 0) return layout;

  const sorted = [...events].sort(
    (a, b) =>
      a.start.getTime() - b.start.getTime() ||
      b.end.getTime() - a.end.getTime(),
  );

  let cluster: TimedEvent[] = [];
  let clusterEnd = -Infinity;

  const packCluster = (clusterEvents: TimedEvent[]) => {
    if (clusterEvents.length === 0) return;

    const columns: TimedEvent[][] = [];
    const columnIndex = new Map<string, number>();

    for (const event of clusterEvents) {
      let placed = false;
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        if (column[column.length - 1].end.getTime() <= event.start.getTime()) {
          column.push(event);
          columnIndex.set(event.id, i);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
        columnIndex.set(event.id, columns.length - 1);
      }
    }

    const columnCount = columns.length;
    for (const event of clusterEvents) {
      const eventColumn = columnIndex.get(event.id);
      if (eventColumn === undefined) continue;

      let span = 1;
      for (let c = eventColumn + 1; c < columnCount; c++) {
        const conflicts = columns[c].some(
          (other) => other.start < event.end && other.end > event.start,
        );
        if (conflicts) break;
        span++;
      }

      layout.set(event.id, {
        left: (eventColumn / columnCount) * 100,
        width: (span / columnCount) * 100,
      });
    }
  };

  for (const event of sorted) {
    if (cluster.length > 0 && event.start.getTime() >= clusterEnd) {
      packCluster(cluster);
      cluster = [];
      clusterEnd = -Infinity;
    }
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd, event.end.getTime());
  }
  packCluster(cluster);

  return layout;
}
