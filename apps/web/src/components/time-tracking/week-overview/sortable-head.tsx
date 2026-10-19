import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TableHead } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { type OverviewSort, type OverviewSortKey } from "@/lib/time-tracking/calculations/week-overview"

/** Spaltenkopf mit Sortier-Button; `aria-sort` meldet die Richtung an Screenreader. */
export function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string
  sortKey: OverviewSortKey
  sort: OverviewSort | null
  onSort: (key: OverviewSortKey) => void
  className?: string
}) {
  const direction = sort?.key === sortKey ? sort.direction : null
  const icon =
    direction === "asc"
      ? ArrowUp01Icon
      : direction === "desc"
        ? ArrowDown01Icon
        : ArrowUpDownIcon

  return (
    <TableHead
      aria-sort={
        direction === "asc"
          ? "ascending"
          : direction === "desc"
            ? "descending"
            : "none"
      }
      className={className}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md text-xs font-medium tracking-wide uppercase outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50",
          direction ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-3.5" aria-hidden />
      </button>
    </TableHead>
  )
}
