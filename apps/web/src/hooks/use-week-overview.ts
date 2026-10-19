import { useMemo, useState } from "react"

import { summarizeWeek } from "@/lib/time-tracking/calculations/totals"
import {
  buildWeekOverview,
  sortOverview,
  toggleSort,
  type OverviewSort,
  type OverviewSortKey,
} from "@/lib/time-tracking/calculations/week-overview"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"

/**
 * Summen und Zeilen der Wochenübersicht samt Sortierung. Memoisiert, damit
 * Tippen im Formular die Übersicht nicht neu berechnet.
 */
export function useWeekOverview({
  entries,
  projects,
  tasks,
  workdays,
  today,
}: {
  entries: TimeBooking[]
  projects: Project[]
  tasks: TrackedTask[]
  workdays: Date[]
  today: Date
}) {
  const [sort, setSort] = useState<OverviewSort | null>(null)

  const totals = useMemo(
    () => summarizeWeek(entries, workdays, today),
    [entries, workdays, today]
  )
  const groups = useMemo(
    () => sortOverview(buildWeekOverview(entries, projects, tasks, workdays), sort),
    [entries, projects, tasks, workdays, sort]
  )

  function sortBy(key: OverviewSortKey) {
    setSort((current) => toggleSort(current, key))
  }

  return { totals, groups, sort, sortBy }
}
