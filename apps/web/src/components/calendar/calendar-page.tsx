import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Layers01Icon,
  SquareIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@workspace/ui/components/button"
import { useEffect, useState } from "react"

import { CalendarDayView } from "@/components/calendar/calendar-day-view"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { CalendarViewSwitch } from "@/components/calendar/calendar-view-switch"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { PageHeader } from "@/components/shared/page-header"
import { DUMMY_PROJECTS } from "@/dummy-data/projects"
import { DUMMY_TRACKED_TASKS } from "@/dummy-data/tracked-tasks"
import { useNow } from "@/hooks/use-now"
import { getDictionary } from "@/i18n"
import {
  getStartedTaskIds,
  groupEntriesByDay,
  toCalendarEntries,
  toDayKey,
  withPinnedOrder,
} from "@/lib/calendar/entries"
import {
  getViewTitle,
  shiftDate,
  type CalendarView,
} from "@/lib/calendar/calendar-view"
import { getMonthGrid, isSameMonth } from "@/lib/calendar/month-grid"
import { rehydrateTaskTimer, useTaskTimerStore } from "@/lib/task-timer-store"
import { getWeekDays, startOfWeek } from "@/lib/week"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import { fillTemplate } from "@/utils/fill-template"

// Die Daten kommen per Props rein (Default: Dummy-Daten). Für die API-Anbindung
// Directus-Daten auf `TrackedTask` (inkl. Zeiteinträgen) und `Project` mappen.
// "In Bearbeitung" ergibt sich aus der Zeiterfassung (siehe `getStartedTaskIds`).
export function CalendarPage({
  locale,
  tasks: initialTasks = DUMMY_TRACKED_TASKS,
  projects = DUMMY_PROJECTS,
}: {
  locale?: string
  tasks?: TrackedTask[]
  projects?: Project[]
}) {
  const labels = getDictionary(locale).calendarPage
  const today = new Date(useNow(60_000))
  const [view, setView] = useState<CalendarView>("month")
  // Bezugsdatum der Ansicht; Monat/Woche/Tag ergeben sich daraus.
  const [date, setDate] = useState(() => new Date())
  const [tasks, setTasks] = useState(initialTasks)
  // Reihenfolge je Tag nach dem Abhaken einfrieren, damit die Card an ihrer
  // Stelle bleibt; beim Navigieren wird wieder nach Wichtigkeit sortiert.
  const [pinnedOrder, setPinnedOrder] = useState<Record<string, string[]>>({})

  const activeTimer = useTaskTimerStore((state) => state.active)
  const bookedEntries = useTaskTimerStore((state) => state.entries)
  const stopTimer = useTaskTimerStore((state) => state.stop)
  // Gespeicherten Timer erst nach dem Mount laden (siehe task-timer-store).
  useEffect(() => rehydrateTaskTimer(), [])

  const startedTaskIds = getStartedTaskIds(
    tasks,
    bookedEntries,
    activeTimer?.taskId ?? null
  )
  const entriesByDay = withPinnedOrder(
    groupEntriesByDay(
      toCalendarEntries(tasks, projects, today, startedTaskIds)
    ),
    pinnedOrder
  )
  const navigation = labels.navigation[view]

  function navigate(next: { date?: Date; view?: CalendarView }) {
    if (next.date) setDate(next.date)
    if (next.view) setView(next.view)
    setPinnedOrder({})
  }

  function pinDayOf(task: TrackedTask) {
    const key = toDayKey(task.dueDate)
    const ids = (entriesByDay.get(key) ?? []).map((entry) => entry.id)
    setPinnedOrder((current) =>
      current[key] ? current : { ...current, [key]: ids }
    )
  }

  // Abgeschlossene Aufgabe, die nach Rückfrage wieder geöffnet werden soll.
  const [taskToReopen, setTaskToReopen] = useState<TrackedTask | null>(null)

  function setTaskDone(taskId: string, done: boolean) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, done, completedAt: done ? new Date() : undefined }
          : task
      )
    )
  }

  function toggleTask(taskId: string) {
    const task = tasks.find((candidate) => candidate.id === taskId)
    if (!task) return
    pinDayOf(task)
    if (task.done) {
      setTaskToReopen(task)
    } else {
      // Läuft der Timer für diese Aufgabe, Zeit buchen statt weiterlaufen lassen.
      if (activeTimer?.taskId === taskId) stopTimer()
      setTaskDone(taskId, true)
    }
  }

  function confirmReopen() {
    if (taskToReopen) setTaskDone(taskToReopen.id, false)
    setTaskToReopen(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={labels.title}
        subtitle={labels.subtitle}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={navigation.previous}
                onClick={() => navigate({ date: shiftDate(date, view, -1) })}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
              </Button>
              <h2
                aria-live="polite"
                className="min-w-32 text-center text-base font-semibold text-foreground"
              >
                {getViewTitle(date, view, labels.weekTitle)}
              </h2>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label={navigation.next}
                onClick={() => navigate({ date: shiftDate(date, view, 1) })}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ date: new Date() })}
            >
              {labels.today}
            </Button>
            <CalendarViewSwitch
              value={view}
              onChange={(nextView) => navigate({ view: nextView })}
              labels={labels}
            />
          </div>
        }
      />

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
        <div className="flex items-center gap-3 px-1 text-xs text-muted-foreground">
          <span>{labels.legend}</span>
          <span className="font-semibold text-foreground">
            {labels.legendType}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={Layers01Icon}
              size={14}
              strokeWidth={2}
              aria-hidden
            />
            {labels.project}
          </span>
          <span className="flex items-center gap-1">
            <HugeiconsIcon
              icon={SquareIcon}
              size={14}
              strokeWidth={2}
              aria-hidden
            />
            {labels.task}
          </span>
        </div>

        {view === "day" ? (
          <CalendarDayView
            entries={entriesByDay.get(toDayKey(date)) ?? []}
            today={today}
            labels={labels}
            onToggleTask={toggleTask}
          />
        ) : (
          <CalendarGrid
            weeks={
              view === "month"
                ? getMonthGrid(date)
                : [getWeekDays(startOfWeek(date))]
            }
            entriesByDay={entriesByDay}
            isCurrentPeriod={(day) => view === "week" || isSameMonth(day, date)}
            showAll={view === "week"}
            today={today}
            labels={labels}
            onToggleTask={toggleTask}
            onOpenDay={(day) => navigate({ date: day, view: "day" })}
          />
        )}
      </section>

      <ConfirmDialog
        open={taskToReopen !== null}
        onConfirm={confirmReopen}
        onCancel={() => setTaskToReopen(null)}
        title={labels.reopenDialog.title}
        description={fillTemplate(labels.reopenDialog.description, {
          title: taskToReopen?.title ?? "",
        })}
        confirmLabel={labels.reopenDialog.confirm}
        cancelLabel={labels.reopenDialog.cancel}
      />
    </div>
  )
}
