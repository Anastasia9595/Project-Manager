import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { formatHoursMinutes } from "@/lib/tracked-tasks"

export function TimeSummaryCard({
  icon,
  label,
  seconds,
  unit,
}: {
  icon: IconSvgElement
  label: string
  seconds: number
  unit: string
}) {
  return (
    <div className="flex flex-1 flex-col gap-1 px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <HugeiconsIcon icon={icon} className="size-3.5" />
        {label}
      </p>
      <p className="text-2xl leading-tight font-semibold text-foreground tabular-nums">
        {formatHoursMinutes(seconds)}{" "}
        <span className="text-sm font-normal text-muted-foreground">
          {unit}
        </span>
      </p>
    </div>
  )
}
