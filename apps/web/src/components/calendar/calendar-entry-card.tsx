import { Layers01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Progress, ProgressLabel } from "@workspace/ui/components/progress"

import { CalendarDueFooter } from "@/components/calendar/calendar-due-footer"
import { CalendarStatusChip } from "@/components/calendar/calendar-status-chip"
import type { Dictionary } from "@/i18n"
import { getDueFooter } from "@/lib/calendar/due-footer"
import type {
  CalendarEntry,
  CalendarProjectEntry,
  CalendarTaskEntry,
} from "@/models/calendar-entry"
import { fillTemplate } from "@/utils/fill-template"

type CalendarLabels = Dictionary["calendarPage"]

// Checkbox bleibt optisch 16px, die Trefferfläche wird per ::after auf 44x44px vergrößert.
const CHECKBOX_CLASSNAME =
  "relative mt-0.5 size-4 rounded-[4px] border-table-foreground bg-card after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2 data-checked:border-foreground data-checked:bg-foreground [&_[data-slot=checkbox-indicator]]:text-background"

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <article className="flex min-w-0 flex-col gap-2 rounded-xl border border-border bg-card p-2.5 shadow-xs">
      {children}
    </article>
  )
}

function TaskCard({
  entry,
  today,
  labels,
  onToggleTask,
}: {
  entry: CalendarTaskEntry
  today: Date
  labels: CalendarLabels
  onToggleTask: (taskId: string) => void
}) {
  const done = entry.status === "done"
  const titleId = `${entry.id}-title`

  return (
    <CardShell>
      <CalendarStatusChip
        status={entry.status}
        label={labels.status[entry.status]}
      />
      <div className="flex min-w-0 items-start gap-2">
        <Checkbox
          checked={done}
          onCheckedChange={() => onToggleTask(entry.taskId)}
          aria-labelledby={titleId}
          className={CHECKBOX_CLASSNAME}
        />
        <div className="min-w-0 flex-1">
          <p
            id={titleId}
            title={entry.title}
            className={`truncate text-xs font-semibold ${done ? "text-table-foreground line-through" : "text-foreground"}`}
          >
            {entry.title}
          </p>
          <p
            title={entry.projectName}
            className="truncate text-[11px] text-table-foreground"
          >
            {entry.projectName}
          </p>
        </div>
      </div>
      <CalendarDueFooter
        footer={getDueFooter(
          { dueDate: entry.dueDate, done, completedAt: entry.completedAt },
          today,
          labels.footer
        )}
      />
    </CardShell>
  )
}

function ProjectCard({
  entry,
  today,
  labels,
}: {
  entry: CalendarProjectEntry
  today: Date
  labels: CalendarLabels
}) {
  const { done, total } = entry.progress
  const percent = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <CardShell>
      <CalendarStatusChip
        status={entry.status}
        label={labels.status[entry.status]}
      />
      <div className="flex min-w-0 items-start gap-2">
        <HugeiconsIcon
          icon={Layers01Icon}
          size={16}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-foreground"
          aria-label={labels.project}
        />
        <div className="min-w-0 flex-1">
          <p
            title={entry.name}
            className="truncate text-xs font-semibold text-foreground"
          >
            {entry.name}
          </p>
          <p
            title={entry.customer}
            className="truncate text-[11px] text-table-foreground"
          >
            {entry.customer}
          </p>
        </div>
      </div>
      <Progress
        value={percent}
        // Feste Sprache: sonst formatiert der Server "43%", der Browser "43 %" (Hydration-Fehler).
        locale="de-DE"
        className="gap-x-2 gap-y-1.5 [&_[data-slot=progress-track]]:h-1.5"
      >
        <ProgressLabel className="min-w-0 flex-1 text-[11px] leading-tight font-normal text-table-foreground">
          {fillTemplate(labels.progress, { done, total })}
        </ProgressLabel>
        <span className="shrink-0 text-[11px] font-semibold text-foreground tabular-nums">
          {percent} %
        </span>
      </Progress>
      <CalendarDueFooter
        footer={getDueFooter(
          { dueDate: entry.dueDate, done: false },
          today,
          labels.footer
        )}
      />
    </CardShell>
  )
}

/** Kalender-Card; die Variante (Aufgabe/Projekt, Status) ergibt sich aus dem Eintrag. */
export function CalendarEntryCard({
  entry,
  today,
  labels,
  onToggleTask,
}: {
  entry: CalendarEntry
  today: Date
  labels: CalendarLabels
  onToggleTask: (taskId: string) => void
}) {
  return entry.kind === "task" ? (
    <TaskCard
      entry={entry}
      today={today}
      labels={labels}
      onToggleTask={onToggleTask}
    />
  ) : (
    <ProjectCard entry={entry} today={today} labels={labels} />
  )
}
