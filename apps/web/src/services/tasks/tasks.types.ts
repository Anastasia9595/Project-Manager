import type { TaskPriority } from "@/models/task"
import type { PrintingLineStatus } from "@/services/projects/projects.types"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

/** Zeile aus `tasks`, nur die geladenen Felder. */
export type TaskItemRow = {
  id: string
  task_name: string | null
  priority: TaskPriority | null
  due_date: string | null
  completed: boolean | null
  completed_at: string | null
  printing_lines: {
    id: string
    name: string | null
    status: PrintingLineStatus | null
    tenant: { tenant_name: string | null } | null
  } | null
  time_entries: TimeEntryRow[] | null
}
