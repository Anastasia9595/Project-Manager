import { getProjectStats } from "@/lib/project-stats"
import type { Project } from "@/models/project"
import { ProjectStatCard } from "./project-stat-card"

export function ProjectStats({ projects }: { projects: Project[] }) {
  const stats = getProjectStats(projects, new Date())
  return (
    <div className="@container">
      <div className="grid grid-cols-2 gap-3 @5xl:grid-cols-4 @5xl:gap-4">
        {stats.map((stat) => (
          <ProjectStatCard key={stat.label} {...stat} unit="Projekte" />
        ))}
      </div>
    </div>
  )
}
