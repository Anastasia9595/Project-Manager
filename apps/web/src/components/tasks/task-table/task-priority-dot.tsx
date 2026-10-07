import type { TaskPriority } from "@/models/task"

const DOT_CLASSNAME: Record<TaskPriority, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
}

export function TaskPriorityDot({
  priority,
  label,
}: {
  priority: TaskPriority
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className={`size-2 rounded-full ${DOT_CLASSNAME[priority]}`}
      />
      {label}
    </span>
  )
}
