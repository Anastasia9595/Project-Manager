import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons"

import { Card } from "@/components/shared/card"
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
    <Card className="flex w-full divide-x divide-border sm:w-fit sm:min-w-96">
      <TimeSummaryCard
        icon={Clock01Icon}
        label={labels.today}
        seconds={todaySeconds}
        unit={labels.unit}
      />
      <TimeSummaryCard
        icon={Calendar03Icon}
        label={labels.week}
        seconds={weekSeconds}
        unit={labels.unit}
      />
    </Card>
  )
}
