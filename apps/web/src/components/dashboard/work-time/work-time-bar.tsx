import { formatHours } from "@/lib/work-time"
import type { WorkDay } from "@/models/work-day"

type WorkTimeBarProps = {
  day: WorkDay
  axisMax: number
}

function toPercent(hours: number, axisMax: number): number {
  return (hours / axisMax) * 100
}

/**
 * Eine Säule: helle Soll-Fläche als Hintergrund, Ist-Fläche darüber ab der Grundlinie.
 * Die ganze Spalte ist Hover-/Fokus-Ziel, damit man die Säule nicht auf den Pixel treffen muss.
 */
export function WorkTimeBar({ day, axisMax }: WorkTimeBarProps) {
  const targetPercent = toPercent(day.targetHours, axisMax)
  const actualPercent = toPercent(day.actualHours, axisMax)
  const tooltipBottom = Math.max(targetPercent, actualPercent)

  return (
    <div
      tabIndex={0}
      role="img"
      aria-label={`${day.name}: ${formatHours(day.actualHours)} von ${formatHours(day.targetHours)} Stunden`}
      className="group relative flex h-full flex-1 justify-center outline-none"
    >
      <div className="relative h-full w-full max-w-10">
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-lg bg-primary/35 transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
          style={{ height: `${targetPercent}%` }}
        />
        <div
          className="absolute inset-x-0 bottom-0 rounded-t-lg bg-primary transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80"
          style={{ height: `${actualPercent}%` }}
        />
      </div>
      <div
        role="presentation"
        className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{ bottom: `calc(${tooltipBottom}% + 0.5rem)` }}
      >
        <p className="mb-1 text-muted-foreground">{day.name}</p>
        <p className="flex items-center gap-2 text-foreground">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-primary" />
          <span className="font-bold">{formatHours(day.actualHours)} h</span>
          <span className="text-muted-foreground">Ist</span>
        </p>
        <p className="flex items-center gap-2 text-foreground">
          <span aria-hidden className="h-0.5 w-3 rounded-full bg-primary/35" />
          <span className="font-bold">{formatHours(day.targetHours)} h</span>
          <span className="text-muted-foreground">Soll</span>
        </p>
      </div>
    </div>
  )
}
