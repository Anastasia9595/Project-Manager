import { Clock01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Card } from "@/components/shared/card"
import type { Dictionary } from "@/i18n"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import { fillTemplate } from "@/utils/fill-template"

const MAX_PROGRESS = 100
const RADIUS = 44
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

type StatusLabels = Dictionary["timeTrackingPage"]["status"]

function formatEntryCount(count: number, labels: StatusLabels["entryCount"]) {
  return count === 1 ? labels.one : fillTemplate(labels.other, { count })
}

/** Heute erfasst (immer sichtbar, Hauptinfo) + Wochenstatus mit Fortschritt (Zusatzinfo). */
export function WeekStatusCard({
  actualMinutes,
  targetMinutes,
  percent,
  todayMinutes,
  todayCount,
  labels,
}: {
  actualMinutes: number
  targetMinutes: number
  percent: number
  todayMinutes: number
  todayCount: number
  labels: StatusLabels
}) {
  const percentLabel = `${percent} %`
  return (
    <Card className="grid grid-cols-[1fr_auto] items-center gap-4 p-5 md:gap-8">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          <HugeiconsIcon
            icon={Clock01Icon}
            strokeWidth={2}
            className="size-4 text-due-today"
            aria-hidden
          />
          {labels.today}
        </p>
        <p className="mt-1 text-4xl leading-none font-bold text-foreground tabular-nums">
          {formatDuration(todayMinutes)}
        </p>
        <p className="mt-1.5 text-xs font-medium text-due-today">
          {formatEntryCount(todayCount, labels.entryCount)}
        </p>
      </div>

      <div>
        <div
          role="progressbar"
          aria-label={labels.progress}
          aria-valuemin={0}
          aria-valuemax={MAX_PROGRESS}
          aria-valuenow={Math.min(percent, MAX_PROGRESS)}
          aria-valuetext={percentLabel}
          className="relative size-32 shrink-0"
        >
          <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-accent/50" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-primary transition-[stroke-dashoffset]"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - Math.min(percent, MAX_PROGRESS) / MAX_PROGRESS)}
            />
          </svg>
          <div className="absolute inset-3 flex flex-col items-center justify-center text-center whitespace-nowrap tabular-nums">
            <span className="text-lg leading-tight font-bold text-foreground">
              {formatDuration(actualMinutes)}
            </span>
            <span className="text-[11px] leading-tight text-muted-foreground">
              {fillTemplate(labels.ofTarget, {
                target: formatDuration(targetMinutes),
              })}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
