import { TableCell, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { TODAY_COLUMN_CLASS } from "@/components/time-tracking/week-overview/types"
import { isSameDay } from "@/lib/week"

/** Fußzeile mit Beschriftung, einem Wert je Tag und der Wochensumme. */
export function FooterRow({
  label,
  days,
  today,
  values,
  total,
  className,
  valueClass,
  totalClass,
}: {
  label: string
  days: Date[]
  today: Date
  values: string[]
  total: string
  className?: string
  valueClass?: (index: number) => string
  totalClass?: string
}) {
  return (
    <TableRow className={cn("hover:bg-transparent", className)}>
      <TableCell>{label}</TableCell>
      {days.map((day, index) => (
        <TableCell
          key={day.getTime()}
          className={cn(
            "text-center tabular-nums",
            isSameDay(day, today) && TODAY_COLUMN_CLASS,
            valueClass?.(index)
          )}
        >
          {values[index]}
        </TableCell>
      ))}
      <TableCell className={cn("text-center tabular-nums", totalClass)}>
        {total}
      </TableCell>
    </TableRow>
  )
}
