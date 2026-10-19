import { Clock01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Progress,
  ProgressLabel,
} from "@workspace/ui/components/progress"

import { Card } from "@/components/shared/card"
import type { Dictionary } from "@/i18n"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import { fillTemplate } from "@/utils/fill-template"

const MAX_PROGRESS = 100

type StatusLabels = Dictionary["timeTrackingPage"]["status"]

function formatEntryCount(count: number, labels: StatusLabels["entryCount"]) {
  return count === 1 ? labels.one : fillTemplate(labels.other, { count })
}

/** Wochenstatus: Ist/Soll, Fortschritt und die Kachel „Heute erfasst“. */
export function WeekStatusCard({
  weekNumber,
  actualMinutes,
  targetMinutes,
  percent,
  todayMinutes,
  todayCount,
  labels,
}: {
  weekNumber: number
  actualMinutes: number
  targetMinutes: number
  percent: number
  todayMinutes: number
  todayCount: number
  labels: StatusLabels
}) {
  const percentLabel = `${percent} %`
  return (
    <Card className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {fillTemplate(labels.title, { week: weekNumber })}
          </p>
          <p className="text-3xl font-bold text-foreground tabular-nums">
            {formatDuration(actualMinutes)}
          </p>
          <p className="text-sm text-muted-foreground">
            {fillTemplate(labels.ofTarget, {
              target: formatDuration(targetMinutes),
            })}
          </p>
        </div>
        <div className="flex min-w-40 items-start justify-between gap-6 rounded-2xl border border-border p-4">
          <div>
            <p className="text-sm text-muted-foreground">{labels.today}</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">
              {formatDuration(todayMinutes)}
            </p>
            <p className="text-xs font-medium text-due-today">
              {formatEntryCount(todayCount, labels.entryCount)}
            </p>
          </div>
          <HugeiconsIcon
            icon={Clock01Icon}
            strokeWidth={2}
            className="size-5 text-due-today"
            aria-hidden
          />
        </div>
      </div>
      <Progress
        value={Math.min(percent, MAX_PROGRESS)}
        // Fester Text statt Intl-Formatierung der Laufzeit-Locale – sonst
        // weichen Server ("0 %") und Browser ("0%") voneinander ab.
        getAriaValueText={() => percentLabel}
        className="gap-2"
      >
        <ProgressLabel className="text-xs font-normal text-muted-foreground">
          {labels.progress}
        </ProgressLabel>
        <span className="ml-auto text-xs font-semibold text-foreground tabular-nums">
          {percentLabel}
        </span>
      </Progress>
    </Card>
  )
}
