import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible"

import { TaskGroupTrigger } from "@/components/tasks/task-group/task-group-trigger"
import { TaskCard } from "@/components/tasks/view/task-card"
import type { Dictionary } from "@/i18n"
import { useCollapsedIds } from "@/hooks/use-collapsed-ids"
import { TASK_GROUP_ORDER, type TaskGroupKey } from "@/lib/tracked-tasks"
import type { TaskRow } from "@/models/task"

/** Kanban: eine Spalte je Fälligkeits-Gruppe, auch leere bleiben sichtbar. */
export function TaskBoard({
  groups,
  dict,
}: {
  groups: { key: TaskGroupKey; tasks: TaskRow[] }[]
  dict: Dictionary["tasksPage"]
}) {
  const { isExpanded, toggle } = useCollapsedIds()

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {TASK_GROUP_ORDER.map((key) => {
        const tasks = groups.find((group) => group.key === key)?.tasks ?? []
        return (
          <Collapsible
            key={key}
            open={isExpanded(key)}
            onOpenChange={() => toggle(key)}
            render={<section aria-label={dict.groups[key]} />}
            className="flex flex-col gap-3 rounded-2xl bg-muted/20 p-3"
          >
            <TaskGroupTrigger
              title={dict.groups[key]}
              count={tasks.length}
              open={isExpanded(key)}
            />
            <CollapsibleContent className="flex flex-col gap-3">
              {tasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  {dict.emptyColumn}
                </p>
              ) : (
                tasks.map((task) => (
                  <TaskCard key={task.id} task={task} dict={dict} />
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}
