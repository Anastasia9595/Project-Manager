import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible"
import { DataTable } from "@workspace/ui/components/data-table"

import { Card } from "@/components/shared/card"
import { TaskGroupTrigger } from "@/components/tasks/task-group/task-group-trigger"
import type { TaskRow } from "@/models/task"

export function TaskGroup({
  title,
  tasks,
  columns,
}: {
  title: string
  tasks: TaskRow[]
  columns: ColumnDef<TaskRow, unknown>[]
}) {
  const [open, setOpen] = useState(true)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="flex flex-col gap-2"
    >
      <TaskGroupTrigger title={title} count={tasks.length} open={open} />
      <CollapsibleContent>
        <Card className="px-4 py-2">
          <DataTable columns={columns} data={tasks} />
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
}
