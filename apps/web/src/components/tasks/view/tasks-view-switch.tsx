import {
  KanbanIcon,
  LeftToRightListBulletIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import type { Dictionary } from "@/i18n"

const TASKS_VIEWS = ["list", "kanban"] as const
export type TasksView = (typeof TASKS_VIEWS)[number]

const VIEW_ICONS = { list: LeftToRightListBulletIcon, kanban: KanbanIcon }

/** Umschalter Liste / Kanban (gleiche Optik wie der Kalender-Umschalter). */
export function TasksViewSwitch({
  value,
  onChange,
  labels,
}: {
  value: TasksView
  onChange: (view: TasksView) => void
  labels: Dictionary["tasksPage"]
}) {
  return (
    <div
      role="group"
      aria-label={labels.viewSwitch}
      className="flex rounded-4xl border border-border bg-input/30 p-0.5"
    >
      {TASKS_VIEWS.map((view) => {
        const active = view === value
        return (
          <button
            key={view}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(view)}
            className={`flex h-7 cursor-pointer items-center gap-1.5 rounded-4xl px-3 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none ${
              active
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HugeiconsIcon icon={VIEW_ICONS[view]} className="size-4" />
            {labels.views[view]}
          </button>
        )
      })}
    </div>
  )
}
