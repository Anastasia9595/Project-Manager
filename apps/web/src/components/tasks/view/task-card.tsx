import { TaskPriorityBadge } from "@/components/dashboard/my-tasks/task-priority-badge"
import { TaskDueDateLabel } from "@/components/tasks/task-table/task-due-date-label"
import { TaskTimerButton } from "@/components/tasks/task-table/task-timer-button"
import type { Dictionary } from "@/i18n"
import { formatClock, formatHoursMinutes } from "@/lib/tracked-tasks"
import type { TaskRow } from "@/models/task"

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
      className={`flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-xs transition-shadow hover:shadow-sm ${
        task.isRunning
          ? "border-destructive/40 ring-1 ring-destructive/20"
          : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <TaskPriorityBadge
          priority={task.priority}
          label={dict.priority[task.priority]}
        />
        <TaskDueDateLabel date={task.dueDate} />
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">
          {task.title}
        </h3>
        <p
          className="truncate text-xs text-muted-foreground"
          title={`${task.projectName} · ${task.customer}`}
        >
          {task.projectName}
          {task.customer && ` · ${task.customer}`}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-2">
        <span
          className={`flex items-center gap-1.5 text-xs tabular-nums ${
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
