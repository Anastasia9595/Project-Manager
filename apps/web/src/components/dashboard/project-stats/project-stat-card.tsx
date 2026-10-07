import { HugeiconsIcon } from "@hugeicons/react"

import type { ProjectStat, ProjectStatTone } from "@/models/project-stat"

const TONE_CLASSNAMES: Record<ProjectStatTone, string> = {
  error: "bg-destructive-tint text-destructive-dark",
  warning: "bg-warning-tint text-warning-dark",
  success: "bg-success-tint text-success-dark",
  neutral: "bg-muted text-muted-foreground",
}

export function ProjectStatCard({ label, value, unit, icon, tone }: ProjectStat) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 sm:gap-4 sm:p-5">
      <div
        className={`flex size-10 shrink-0 items-center justify-center rounded-xl sm:size-12 ${TONE_CLASSNAMES[tone]}`}
      >
        <HugeiconsIcon icon={icon} className="size-5 sm:size-6" strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-foreground">
          <span className="text-2xl font-bold">{value}</span>{" "}
          <span className="text-sm font-medium">{unit}</span>
        </p>
      </div>
    </div>
  )
}
