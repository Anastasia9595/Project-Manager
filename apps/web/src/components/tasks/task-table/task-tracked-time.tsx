import { formatHoursMinutes } from "@/lib/tracked-tasks"

export function TaskTrackedTime({
  seconds,
  unit,
}: {
  seconds: number
  unit: string
}) {
  return (
    <span className="tabular-nums">
      {formatHoursMinutes(seconds)} {unit}
    </span>
  )
}
