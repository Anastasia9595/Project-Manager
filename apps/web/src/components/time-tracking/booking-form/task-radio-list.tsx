import { CalendarStatusChip } from "@/components/calendar/calendar-status-chip"
import type { Dictionary } from "@/i18n"
import { getTaskWorkStatus } from "@/lib/task-status"
import type { TrackedTask } from "@/models/task"

/**
 * Aufgaben eines Projekts als Radio-Liste mit Status-Badge. Native Radio-Inputs
 * liefern Tastatursteuerung (Pfeiltasten) und Screenreader-Semantik mit.
 */
export function TaskRadioList({
  name,
  tasks,
  value,
  onChange,
  startedTaskIds,
  statusLabels,
  disabled,
}: {
  name: string
  tasks: TrackedTask[]
  value: string | null
  onChange: (taskId: string) => void
  startedTaskIds: ReadonlySet<string>
  statusLabels: Dictionary["calendarPage"]["status"]
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-background p-1">
      {tasks.map((task) => {
        const status = getTaskWorkStatus(task, startedTaskIds)
        return (
          <label
            key={task.id}
            className="group flex cursor-pointer items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm transition-colors hover:bg-card has-checked:border-primary has-checked:bg-secondary has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-50"
          >
            <input
              type="radio"
              name={name}
              value={task.id}
              checked={value === task.id}
              onChange={() => onChange(task.id)}
              disabled={disabled}
              className="sr-only"
            />
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-muted group-has-checked:bg-primary"
            />
            <span className="flex-1 text-table-foreground group-has-checked:font-semibold group-has-checked:text-due-today">
              {task.title}
            </span>
            <CalendarStatusChip status={status} label={statusLabels[status]} />
          </label>
        )
      })}
    </div>
  )
}
