import { Badge } from "@workspace/ui/components/badge"

import type { TaskPriority } from "@/models/task"

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
}

const PRIORITY_CLASSNAME: Record<TaskPriority, string> = {
  high: "border-transparent bg-destructive-tint text-destructive-dark",
  medium: "border-transparent bg-warning-tint text-warning-dark",
  low: "border-transparent bg-success-tint text-success-dark",
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return <Badge className={PRIORITY_CLASSNAME[priority]}>{PRIORITY_LABEL[priority]}</Badge>
}
