import { Folder01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

import { TaskPriorityBadge } from "@/components/dashboard/my-tasks/task-priority-badge"
import {
  TaskDueDateLabel,
  TaskDueNote,
} from "@/components/tasks/task-table/task-due-date-label"
import { TaskTimerButton } from "@/components/tasks/task-table/task-timer-button"
import type { Dictionary } from "@/i18n"
import { formatClock, formatHoursMinutes } from "@/lib/tracked-tasks"
import type { TaskRow } from "@/models/task"

/** Zeile mit Icon; `label` benennt das Icon für Screenreader. */
function TaskCardMeta({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement
  label: string
  value: string
}) {
  return (
    <p
      className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground first-of-type:mt-1.5"
      title={value}
    >
      <HugeiconsIcon
        icon={icon}
        role="img"
        aria-label={label}
        className="size-3.5 shrink-0"
      />
      <span className="truncate">{value}</span>
    </p>
  )
}

/**
 * Aufgabenkarte fürs Kanban: Priorität, Titel, Projekt,
 * gebuchte Zeit und Start/Stop.
 */
export function TaskCard({
  task,
  dict,
}: {
  task: TaskRow
  dict: Dictionary["tasksPage"]
}) {
  return (
    <article
      className={`flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-xs transition-shadow hover:shadow-sm ${
        task.isRunning
          ? "border-destructive/40 ring-1 ring-destructive/20"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <TaskPriorityBadge
          priority={task.priority}
          label={dict.priority[task.priority]}
        />
        <TaskDueNote date={task.dueDate} />
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {task.title}
        </h3>
        <TaskCardMeta
          icon={Folder01Icon}
          label={dict.columns.project}
          value={task.projectName}
        />
        {task.customer && (
          <TaskCardMeta
            icon={UserIcon}
            label={dict.columns.customer}
            value={task.customer}
          />
        )}
        <p className="mt-1 text-sm">
          <TaskDueDateLabel date={task.dueDate} hideNote />
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-3">
        <span
          className={`flex items-center gap-1.5 text-sm tabular-nums ${
            task.isRunning
              ? "font-semibold text-destructive"
              : "text-muted-foreground"
          }`}
        >
          {task.isRunning && (
            <span
              aria-hidden
              className="size-2 animate-pulse rounded-full bg-destructive motion-reduce:animate-none"
            />
          )}
          {task.isRunning
            ? formatClock(task.trackedSeconds)
            : `${formatHoursMinutes(task.trackedSeconds)} ${dict.hoursUnit}`}
        </span>
        <TaskTimerButton task={task} labels={dict.timer} />
      </div>
    </article>
  )
}
