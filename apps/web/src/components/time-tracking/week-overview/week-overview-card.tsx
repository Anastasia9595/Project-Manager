import type { ComponentProps } from "react"
import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { Skeleton } from "@workspace/ui/components/skeleton"

import { Card } from "@/components/shared/card"
import { OVERVIEW_HEADING_ID } from "@/components/time-tracking/week-overview/focus"
import { WeekOverviewTable } from "@/components/time-tracking/week-overview/week-overview-table"

/** Karte „Wochenübersicht“: Kopf mit Export, darunter Tabelle oder leerer Zustand. */
export function WeekOverviewCard({
  loaded,
  onExport,
  ...tableProps
}: ComponentProps<typeof WeekOverviewTable> & {
  loaded: boolean
  onExport: () => void
}) {
  const { labels, groups } = tableProps
  const isEmpty = groups.length === 0

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        {/* tabIndex -1: Fokusziel, wenn nach dem Löschen eine ganze Zeile verschwindet. */}
        <h2
          id={OVERVIEW_HEADING_ID}
          tabIndex={-1}
          className="rounded-md text-lg font-semibold text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {labels.title}
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={!loaded || isEmpty}
        >
          <HugeiconsIcon icon={Download04Icon} strokeWidth={2} aria-hidden />
          {labels.export}
        </Button>
      </div>
      {!loaded ? (
        <div className="px-5 pb-5">
          <Skeleton className="h-48 w-full" />
        </div>
      ) : isEmpty ? (
        <p className="px-5 pb-8 text-sm text-muted-foreground">{labels.empty}</p>
      ) : (
        <WeekOverviewTable {...tableProps} />
      )}
    </Card>
  )
}
