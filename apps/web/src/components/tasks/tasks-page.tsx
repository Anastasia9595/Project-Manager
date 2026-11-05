import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Toaster } from "@workspace/ui/components/sonner"

import { CreateButton } from "@/components/shared/create-button"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { NewTaskForm } from "@/components/tasks/new-task/new-task-form"
import { RunningTimerBar } from "@/components/tasks/running-timer-bar"
import { TaskGroup } from "@/components/tasks/task-group/task-group"
import { createTaskColumns } from "@/components/tasks/task-table/task-columns"
import { TasksEmptyState } from "@/components/tasks/tasks-empty-state"
import { TimeSummaryCards } from "@/components/tasks/time-summary/time-summary-cards"
import { useStopTimer } from "@/hooks/use-stop-timer"
import { useTrackedTasks } from "@/hooks/use-tracked-tasks"
import { getDictionary } from "@/i18n"
import type { TrackedTask } from "@/models/task"
import { fillTemplate } from "@/utils/fill-template"

/** Wartezeit bis zum Neuladen nach dem Anlegen, damit der Toast kurz sichtbar bleibt. */
const RELOAD_DELAY_MS = 800

export function TasksPage({
  locale,
  tasks,
}: {
  locale?: string
  tasks: TrackedTask[]
}) {
  const dict = getDictionary(locale).tasksPage
  const [query, setQuery] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const reloadTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(reloadTimer.current), [])
  const stopTimer = useStopTimer(dict.timer.bookError)
  const { openTaskCount, summary, runningTimer, groups } = useTrackedTasks(
    tasks,
    query
  )

  const columns = useMemo(() => createTaskColumns(dict), [dict])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.title}
        subtitle={`${openTaskCount} ${dict.openTasks}`}
        actions={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={dict.searchPlaceholder}
            />
            <CreateButton
              label={dict.newTask}
              onClick={() => setFormOpen(true)}
            />
          </>
        }
      />

      {runningTimer && (
        <RunningTimerBar
          taskTitle={runningTimer.task?.title ?? runningTimer.taskId}
          projectName={runningTimer.task?.projectName ?? ""}
          seconds={runningTimer.seconds}
          onStop={stopTimer}
          labels={dict.timer}
        />
      )}

      <TimeSummaryCards
        todaySeconds={summary.todaySeconds}
        weekSeconds={summary.weekSeconds}
        labels={{
          today: dict.summary.today,
          week: dict.summary.week,
          unit: dict.hoursUnit,
        }}
      />

      {groups.length === 0 ? (
        <TasksEmptyState message={dict.noResults} />
      ) : (
        groups.map((group) => (
          <TaskGroup
            key={group.key}
            title={dict.groups[group.key]}
            tasks={group.tasks}
            columns={columns}
          />
        ))
      )}
      <NewTaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={(name) => {
          setFormOpen(false)
          toast.success(fillTemplate(dict.form.created, { name }))
          // Die Liste wird serverseitig geladen; ein Neuladen zeigt die neue Aufgabe.
          reloadTimer.current = window.setTimeout(
            () => window.location.reload(),
            RELOAD_DELAY_MS
          )
        }}
        t={dict.form}
      />
      <Toaster />
    </div>
  )
}
