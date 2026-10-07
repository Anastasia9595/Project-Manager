import { Checkbox } from "@workspace/ui/components/checkbox"

import type { Task } from "@/models/task"
import { TaskPriorityBadge } from "./task-priority-badge"

type TaskListItemProps = {
  task: Task
  onToggle: (id: string) => void
}

export function TaskListItem({ task, onToggle }: TaskListItemProps) {
  const labelId = `task-${task.id}-title`

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-border bg-card px-4 py-3">
      <Checkbox
        aria-labelledby={labelId}
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        className="size-6 rounded-md"
      />
      <div className="min-w-0 flex-1">
        <p
          id={labelId}
          className={`truncate text-sm font-bold text-foreground ${task.done ? "line-through opacity-60" : ""}`}
        >
          {task.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">{task.projectName}</p>
      </div>
      <TaskPriorityBadge priority={task.priority} />
    </li>
  )
}
