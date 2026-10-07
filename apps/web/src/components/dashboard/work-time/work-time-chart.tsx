import { getAxisMax, getAxisTicks } from "@/lib/work-time"
import type { WorkDay } from "@/models/work-day"
import { WorkTimeBar } from "./work-time-bar"

export function WorkTimeChart({ days }: { days: WorkDay[] }) {
  const axisMax = getAxisMax(days)
  const ticks = getAxisTicks(axisMax)
  const targetPercent = (Math.max(...days.map((day) => day.targetHours)) / axisMax) * 100

  return (
    <div className="flex gap-3">
      <div aria-hidden className="relative h-56 w-8 shrink-0">
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute right-0 translate-y-1/2 text-xs text-muted-foreground"
            style={{ bottom: `${(tick / axisMax) * 100}%` }}
          >
            {tick}h
          </span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative h-56">
          {ticks.map((tick) => (
            <div
              key={tick}
              aria-hidden
              className="absolute inset-x-0 border-t border-border"
              style={{ bottom: `${(tick / axisMax) * 100}%` }}
            />
          ))}
          <div
            aria-hidden
            className="absolute inset-x-0 border-t border-dashed border-muted-foreground/50"
            style={{ bottom: `${targetPercent}%` }}
          />
          <div className="absolute inset-0 flex">
            {days.map((day) => (
              <WorkTimeBar key={day.label} day={day} axisMax={axisMax} />
            ))}
          </div>
        </div>
        <div aria-hidden className="mt-3 flex">
          {days.map((day) => (
            <span
              key={day.label}
              className="flex-1 text-center text-xs font-medium text-muted-foreground"
            >
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
