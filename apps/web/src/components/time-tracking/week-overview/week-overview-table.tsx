import { Table, TableBody } from "@workspace/ui/components/table"

import { ProjectRows } from "@/components/time-tracking/week-overview/project-rows"
import type { WeekOverviewTableProps } from "@/components/time-tracking/week-overview/types"
import { WeekOverviewFooter } from "@/components/time-tracking/week-overview/week-overview-footer"
import { WeekOverviewHeader } from "@/components/time-tracking/week-overview/week-overview-header"
import { useCollapsedIds } from "@/hooks/use-collapsed-ids"

/** Wochenübersicht: Kopf, aufklappbare Projekte mit Aufgaben, Fußzeilen. */
export function WeekOverviewTable({
  groups,
  days,
  today,
  entries,
  totals,
  sort,
  onSort,
  labels,
  popoverLabels,
  ...actions
}: WeekOverviewTableProps) {
  const projects = useCollapsedIds()

  return (
    <Table>
      <WeekOverviewHeader
        days={days}
        today={today}
        sort={sort}
        onSort={onSort}
        labels={labels}
      />
      <TableBody>
        {groups.map((group) => (
          <ProjectRows
            key={group.project.id}
            group={group}
            days={days}
            today={today}
            entries={entries}
            expanded={projects.isExpanded(group.project.id)}
            onToggle={() => projects.toggle(group.project.id)}
            labels={labels}
            popoverLabels={popoverLabels}
            {...actions}
          />
        ))}
      </TableBody>
      <WeekOverviewFooter days={days} today={today} totals={totals} labels={labels} />
    </Table>
  )
}
