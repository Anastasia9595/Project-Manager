import { DUMMY_WORK_WEEK } from "@/dummy-data/work-time"
import { formatHours, sumActualHours } from "@/lib/work-time"
import type { WorkDay } from "@/models/work-day"
import { WorkTimeChart } from "./work-time-chart"
import { WorkTimeLegend } from "./work-time-legend"

export function WeeklyWorkTime({ days = DUMMY_WORK_WEEK }: { days?: WorkDay[] }) {
  return (
    <section className="flex flex-col gap-8 rounded-3xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div>
          <h2 className="text-xl font-bold text-foreground">Wöchentliche Arbeitszeit</h2>
          <p className="mt-1 text-lg font-bold text-muted-foreground">
            {formatHours(sumActualHours(days))} Stunden
          </p>
        </div>
        <WorkTimeLegend />
      </div>
      <WorkTimeChart days={days} />
    </section>
  )
}
