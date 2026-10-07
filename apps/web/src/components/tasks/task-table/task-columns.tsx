import type { ColumnDef } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@workspace/ui/components/data-table"

import { TaskDueDateLabel } from "@/components/tasks/task-table/task-due-date-label"
import { TaskPriorityDot } from "@/components/tasks/task-table/task-priority-dot"
import { TaskTimerButton } from "@/components/tasks/task-table/task-timer-button"
import { TaskTrackedTime } from "@/components/tasks/task-table/task-tracked-time"
import type { Dictionary } from "@/i18n"
import { PRIORITY_ORDER } from "@/lib/tasks"
import type { TaskRow } from "@/models/task"

export function createTaskColumns(
  dict: Dictionary["tasksPage"]
): ColumnDef<TaskRow, unknown>[] {
  const { columns, priority, timer, hoursUnit } = dict
  return [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.task} />
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-foreground">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "projectName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.project} />
      ),
      cell: ({ row }) => (
        <span
          className="block max-w-80 truncate"
          title={row.original.projectName}
        >
          {row.original.projectName}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.customer} />
      ),
    },
    {
      id: "priority",
      accessorFn: (row) => PRIORITY_ORDER[row.priority],
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.priority} />
      ),
      cell: ({ row }) => (
        <TaskPriorityDot
          priority={row.original.priority}
          label={priority[row.original.priority]}
        />
      ),
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.dueDate} />
      ),
      cell: ({ row }) => <TaskDueDateLabel date={row.original.dueDate} />,
    },
    {
      accessorKey: "trackedSeconds",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={columns.time} />
      ),
      cell: ({ row }) => (
        <TaskTrackedTime
          seconds={row.original.trackedSeconds}
          unit={hoursUnit}
        />
      ),
    },
    {
      id: "action",
      enableSorting: false,
      header: () => (
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {columns.action}
        </span>
      ),
      cell: ({ row }) => <TaskTimerButton task={row.original} labels={timer} />,
    },
  ]
}
