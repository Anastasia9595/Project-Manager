import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { Card } from "@/components/shared/card"
import { formatHoursMinutes } from "@/lib/tracked-tasks"

export function TimeSummaryCard({
  icon,
  iconClassName,
  label,
  seconds,
  unit,
}: {
  icon: IconSvgElement
  iconClassName: string
  label: string
  seconds: number
  unit: string
}) {
  return (
    <Card className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
      <span
        className={`flex size-11 items-center justify-center rounded-xl ${iconClassName}`}
      >
        <HugeiconsIcon icon={icon} className="size-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl leading-tight font-bold text-foreground tabular-nums">
          {formatHoursMinutes(seconds)}{" "}
          <span className="text-sm font-medium">{unit}</span>
        </p>
      </div>
    </Card>
  )
}
