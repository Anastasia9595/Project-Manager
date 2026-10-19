import { TableFooter } from "@workspace/ui/components/table"

import { FooterRow } from "@/components/time-tracking/week-overview/footer-row"
import type { WeekOverviewTableProps } from "@/components/time-tracking/week-overview/types"
import {
  formatDuration,
  formatOptionalDuration,
  formatOptionalSignedDuration,
} from "@/lib/time-tracking/calculations/duration"
import { hideFutureDays } from "@/lib/time-tracking/calculations/totals"

/** Positive Differenz dezent grün, sonst neutral – bewusst kein Rot. */
function differenceClass(minutes: number | null): string {
  return minutes !== null && minutes > 0 ? "text-success-dark" : "text-foreground"
}

/** Fußzeilen: Gesamt pro Tag, Soll (grau) und Differenz (nur bis heute). */
export function WeekOverviewFooter({
  days,
  today,
  totals,
  labels,
}: Pick<WeekOverviewTableProps, "days" | "today" | "totals" | "labels">) {
  return (
    <TableFooter className="bg-transparent font-normal">
      <FooterRow
        label={labels.dayTotal}
        days={days}
        today={today}
        values={hideFutureDays(totals.perDay, days, today).map(formatOptionalDuration)}
        total={formatOptionalDuration(totals.week)}
        className="bg-background font-semibold hover:bg-background"
      />
      <FooterRow
        label={labels.target}
        days={days}
        today={today}
        values={totals.targets.map(formatDuration)}
        total={formatDuration(totals.weekTarget)}
        className="text-muted-foreground"
      />
      <FooterRow
        label={labels.difference}
        days={days}
        today={today}
        values={totals.differences.map(formatOptionalSignedDuration)}
        total={formatOptionalSignedDuration(totals.weekDifference)}
        valueClass={(index) => differenceClass(totals.differences[index] ?? null)}
        totalClass={differenceClass(totals.weekDifference)}
      />
    </TableFooter>
  )
}
