import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Toaster } from "@workspace/ui/components/sonner"

import { ProjectsTable } from "@/components/dashboard/projects/projects-table"
import { NewProjectForm } from "@/components/projects/new-project/new-project-form"
import {
  ProjectStatusFilter,
  type StatusFilterOption,
} from "@/components/projects/project-status-filter"
import { CreateButton } from "@/components/shared/create-button"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { getDictionary } from "@/i18n"
import type { Project, ProjectStatus } from "@/models/project"
import { fillTemplate } from "@/utils/fill-template"

function matchesQuery(project: Project, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    project.name.toLowerCase().includes(needle) ||
    project.customer.toLowerCase().includes(needle)
  )
}

// Das Design kennt keinen eigenen Filter für "Pausiert" - solche Projekte erscheinen unter "Alle".
type StatusFilter = "all" | Exclude<ProjectStatus, "paused">

const PAGE_SIZE = 10

/** Wartezeit bis zum Neuladen nach dem Anlegen, damit der Toast kurz sichtbar bleibt. */
const RELOAD_DELAY_MS = 800

const STATUS_FILTERS: StatusFilter[] = ["all", "active", "created", "completed"]

export function ProjectsPage({
  locale,
  projects,
  canCreate,
}: {
  locale?: string
  projects: Project[]
  /** Nur interne Rollen dürfen Projekte anlegen. */
  canCreate: boolean
}) {
  const dict = getDictionary(locale).projectsPage
  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const reloadTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(reloadTimer.current), [])

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  // Die Zähler der Filter-Badges beziehen sich auf die Suchtreffer, damit sie zur Tabelle passen.
  const searchedProjects = useMemo(
    () => projects.filter((project) => matchesQuery(project, query)),
    [projects, query]
  )

  const filterOptions: StatusFilterOption<StatusFilter>[] = STATUS_FILTERS.map(
    (value) => ({
      value,
      label: dict.filters[value],
      count:
        value === "all"
          ? searchedProjects.length
          : searchedProjects.filter((project) => project.status === value)
              .length,
    })
  )

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
            {canCreate && (
              <CreateButton
                label={dict.newProject}
                onClick={() => setFormOpen(true)}
              />
            )}
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
      {canCreate && (
        <NewProjectForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onCreated={(name) => {
            setFormOpen(false)
            toast.success(fillTemplate(dict.form.created, { name }))
            // Die Liste wird serverseitig geladen; ein Neuladen zeigt das neue Projekt.
            reloadTimer.current = window.setTimeout(
              () => window.location.reload(),
              RELOAD_DELAY_MS
            )
          }}
          t={dict.form}
        />
      )}
      <Toaster position="bottom-right" />
    </div>
  )
}
