import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"

import { TaskFilterMenu } from "@/components/tasks/view/task-filter-menu"
import type { Dictionary } from "@/i18n"
import {
  EMPTY_TASK_FILTER,
  countFilterOptions,
  type FilterOption,
  type TaskFilter,
} from "@/lib/tracked-tasks"
import type { TrackedTask } from "@/models/task"
import { fillTemplate } from "@/utils/fill-template"

/** Filter-Buttons (Projekt, Priorität, Kunde) und darunter die aktiven Filter als Chips. */
export function TaskFilterBar({
  tasks,
  value,
  onChange,
  dict,
}: {
  tasks: TrackedTask[]
  value: TaskFilter
  onChange: (filter: TaskFilter) => void
  dict: Dictionary["tasksPage"]
}) {
  const open = tasks.filter((task) => !task.done)
  const sections: {
    key: keyof TaskFilter
    title: string
    options: FilterOption[]
    searchable: boolean
  }[] = [
    {
      key: "priority",
      title: dict.columns.priority,
      options: (["high", "medium", "low"] as const).map((priority) => ({
        value: priority,
        label: dict.priority[priority],
        count: open.filter((task) => task.priority === priority).length,
      })),
      searchable: false,
    },
    {
      key: "project",
      title: dict.columns.project,
      options: countFilterOptions(
        open.map((task) => [task.projectId, task.projectName])
      ),
      searchable: true,
    },
    {
      key: "customer",
      title: dict.columns.customer,
      options: countFilterOptions(
        open.map((task) => [task.customer, task.customer])
      ),
      searchable: true,
    },
  ]

  const selected = sections.flatMap((section) =>
    section.options
      .filter((option) => value[section.key].includes(option.value))
      .map((option) => ({ section, option }))
  )

  return (
    <div className="flex min-w-0 flex-1 basis-64 flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <TaskFilterMenu
            key={section.key}
            label={section.title}
            options={section.options}
            selected={value[section.key]}
            onChange={(values) => onChange({ ...value, [section.key]: values })}
            searchable={section.searchable}
            texts={dict.filter}
          />
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {selected.map(({ section, option }) => (
            <Button
              key={`${section.key}-${option.value}`}
              variant="outline"
              className="h-auto min-h-9 max-w-full shrink bg-card py-1 text-left font-normal whitespace-normal"
              aria-label={fillTemplate(dict.filter.remove, {
                name: `${section.title}: ${option.label}`,
              })}
              onClick={() =>
                onChange({
                  ...value,
                  [section.key]: value[section.key].filter(
                    (entry) => entry !== option.value
                  ),
                })
              }
            >
              <span className="min-w-0 wrap-anywhere">
                <span className="text-muted-foreground">{section.title}:</span>{" "}
                {option.label}
              </span>
              <HugeiconsIcon
                icon={Cancel01Icon}
                className="size-3.5 text-muted-foreground"
              />
            </Button>
          ))}
          <Button
            variant="outline"
            className="border-muted bg-card"
            onClick={() => onChange(EMPTY_TASK_FILTER)}
          >
            {dict.filter.reset}
          </Button>
        </div>
      )}
    </div>
  )
}
