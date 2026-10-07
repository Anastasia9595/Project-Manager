import { useMemo, useState } from "react"

import { ProjectsTable } from "@/components/dashboard/projects/projects-table"
import {
  ProjectStatusFilter,
  type StatusFilterOption,
} from "@/components/projects/project-status-filter"
import { CreateButton } from "@/components/shared/create-button"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { DUMMY_PROJECTS } from "@/dummy-data/projects"
import { getDictionary } from "@/i18n"
import type { Project, ProjectStatus } from "@/models/project"

function matchesQuery(project: Project, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    project.name.toLowerCase().includes(needle) || project.customer.toLowerCase().includes(needle)
  )
}

// Das Design kennt keinen eigenen Filter für "Pausiert" - solche Projekte erscheinen unter "Alle".
type StatusFilter = "all" | Exclude<ProjectStatus, "paused">

const PAGE_SIZE = 10

const STATUS_FILTERS: StatusFilter[] = ["all", "active", "created", "completed"]

export function ProjectsPage({
  locale,
  projects = DUMMY_PROJECTS,
}: {
  locale?: string
  projects?: Project[]
}) {
  const dict = getDictionary(locale).projectsPage
  const [query, setQuery] = useState("")

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Die Zähler der Filter-Badges beziehen sich auf die Suchtreffer, damit sie zur Tabelle passen.
  const searchedProjects = useMemo(
    () => projects.filter((project) => matchesQuery(project, query)),
    [projects, query],
  )

  const filterOptions: StatusFilterOption<StatusFilter>[] = STATUS_FILTERS.map((value) => ({
    value,
    label: dict.filters[value],
    count:
      value === "all"
        ? searchedProjects.length
        : searchedProjects.filter((project) => project.status === value).length,
  }))

  const filteredProjects =
    statusFilter === "all"
      ? searchedProjects
      : searchedProjects.filter((project) => project.status === statusFilter)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.title}
        subtitle={dict.subtitle}
        actions={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={dict.searchPlaceholder}
            />
            <CreateButton label={dict.newProject} />
          </>
        }
      />
      <ProjectStatusFilter
        options={filterOptions}
        value={statusFilter}
        onChange={setStatusFilter}
        label={dict.statusFilterLabel}
      />
      <ProjectsTable
        projects={filteredProjects}
        showCirculation
        pageSize={PAGE_SIZE}
        paginationLabels={dict.pagination}
      />
    </div>
  )
}
