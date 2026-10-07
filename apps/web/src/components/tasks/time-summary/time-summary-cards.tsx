import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons"

import { TimeSummaryCard } from "@/components/tasks/time-summary/time-summary-card"

export function TimeSummaryCards({
  todaySeconds,
  weekSeconds,
  labels,
}: {
  todaySeconds: number
  weekSeconds: number
  labels: { today: string; week: string; unit: string }
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <TimeSummaryCard
        icon={Clock01Icon}
        iconClassName="bg-warning-tint text-primary"
        label={labels.today}
        seconds={todaySeconds}
        unit={labels.unit}
      />
      <TimeSummaryCard
        icon={Calendar03Icon}
        iconClassName="bg-muted text-muted-foreground"
        label={labels.week}
        seconds={weekSeconds}
        unit={labels.unit}
      />
    </div>
  )
}
