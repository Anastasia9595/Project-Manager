import { DUMMY_STATS } from "@/dummy-data/project-stats"
import { ProjectStatCard } from "./project-stat-card"

export function ProjectStats() {
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4 @5xl:gap-4">
        {DUMMY_STATS.map((stat) => (
          <ProjectStatCard key={stat.label} {...stat} unit="Projekte" />
        ))}
      </div>
    </div>
  )
}
