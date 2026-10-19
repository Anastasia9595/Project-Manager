import {
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { SortableHead } from "@/components/time-tracking/week-overview/sortable-head"
import {
  TODAY_COLUMN_CLASS,
  type WeekOverviewTableProps,
} from "@/components/time-tracking/week-overview/types"
import { formatColumnDay } from "@/lib/time-tracking/date-labels"
import { isSameDay } from "@/lib/week"

/** Kopfzeile: „Projekt / Aufgabe“ und „Summe“ sortierbar, dazwischen die Tage. */
export function WeekOverviewHeader({
  days,
  today,
  sort,
  onSort,
  labels,
}: Pick<WeekOverviewTableProps, "days" | "today" | "sort" | "onSort" | "labels">) {
  return (
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <SortableHead
          label={labels.projectTask}
          sortKey="name"
          sort={sort}
          onSort={onSort}
          className="w-full min-w-64 pl-5"
        />
        {days.map((day) => {
          const isToday = isSameDay(day, today)
          return (
            <TableHead
              key={day.getTime()}
              className={cn(
                "min-w-24 text-center text-xs font-medium text-muted-foreground",
                isToday && cn(TODAY_COLUMN_CLASS, "text-foreground")
              )}
            >
              {formatColumnDay(day)}
              {isToday && <span className="sr-only">, {labels.today}</span>}
            </TableHead>
          )
        })}
        <SortableHead
          label={labels.total}
          sortKey="total"
          sort={sort}
          onSort={onSort}
          className="min-w-24 text-center"
        />
      </TableRow>
    </TableHeader>
  )
}
