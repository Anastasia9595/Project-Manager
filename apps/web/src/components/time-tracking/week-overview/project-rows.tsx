import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { TableCell, TableRow } from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { IconButton } from "@/components/shared/icon-button"
import { OverviewCell } from "@/components/time-tracking/week-overview/overview-cell"
import {
  TODAY_COLUMN_CLASS,
  type CellActions,
  type OverviewLabels,
  type PopoverLabels,
} from "@/components/time-tracking/week-overview/types"
import { getProjectTitle } from "@/lib/projects"
import { formatOptionalDuration } from "@/lib/time-tracking/calculations/duration"
import {
  entriesOn,
  hideFutureDays,
  isFutureDay,
} from "@/lib/time-tracking/calculations/totals"
import { type OverviewProjectGroup } from "@/lib/time-tracking/calculations/week-overview"
import { isSameDay } from "@/lib/week"
import type { TimeBooking } from "@/models/time-booking"
import { fillTemplate } from "@/utils/fill-template"

/** Projektzeile (aufklappbar, Zwischensummen) und darunter ihre Aufgabenzeilen. */
export function ProjectRows({
  group,
  days,
  today,
  entries,
  expanded,
  onToggle,
  labels,
  popoverLabels,
  ...actions
}: CellActions & {
  group: OverviewProjectGroup
  days: Date[]
  today: Date
  /** Buchungen der Woche – für die Einzeleinträge im Popover. */
  entries: TimeBooking[]
  expanded: boolean
  onToggle: () => void
  labels: OverviewLabels
  popoverLabels: PopoverLabels
}) {
  const projectTitle = getProjectTitle(group.project)
  const dayClass = (day: Date) => cn(isSameDay(day, today) && TODAY_COLUMN_CLASS)
  const visibleMinutes = hideFutureDays(group.minutesByDay, days, today)

  return (
    <>
      <TableRow className="bg-background hover:bg-background">
        <TableCell>
          <div className="flex items-center gap-2">
            <IconButton
              icon={ArrowDown01Icon}
              label={fillTemplate(expanded ? labels.collapse : labels.expand, {
                project: projectTitle,
              })}
              size="icon-xs"
              aria-expanded={expanded}
              className={cn(
                "transition-transform aria-expanded:bg-transparent",
                !expanded && "-rotate-90"
              )}
              onClick={onToggle}
            />
            <div>
              <p className="font-semibold text-foreground">{projectTitle}</p>
              <p className="text-xs text-muted-foreground">{group.project.name}</p>
            </div>
          </div>
        </TableCell>
        {days.map((day, index) => (
          <TableCell
            key={day.getTime()}
            className={cn("text-center font-semibold tabular-nums", dayClass(day))}
          >
            {formatOptionalDuration(visibleMinutes[index] ?? null)}
          </TableCell>
        ))}
        <TableCell className="text-center font-semibold tabular-nums">
          {formatOptionalDuration(group.total)}
        </TableCell>
      </TableRow>

      {expanded &&
        group.tasks.map(({ task, total }) => {
          const taskEntries = entries.filter((entry) => entry.task === task.id)
          return (
            <TableRow key={task.id}>
              <TableCell className="pl-14 text-table-foreground">{task.title}</TableCell>
              {days.map((day) => (
                <TableCell
                  key={day.getTime()}
                  className={cn("p-1 text-center", dayClass(day))}
                >
                  <OverviewCell
                    target={{ projectId: group.project.id, taskId: task.id, date: day }}
                    taskTitle={task.title}
                    projectTitle={projectTitle}
                    entries={entriesOn(taskEntries, day)}
                    isFuture={isFutureDay(day, today)}
                    labels={labels}
                    popoverLabels={popoverLabels}
                    {...actions}
                  />
                </TableCell>
              ))}
              <TableCell className="text-center text-table-foreground tabular-nums">
                {formatOptionalDuration(total)}
              </TableCell>
            </TableRow>
          )
        })}
    </>
  )
}
