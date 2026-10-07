import { useMemo, useState } from "react"

import { CreateButton } from "@/components/shared/create-button"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { RunningTimerBar } from "@/components/tasks/running-timer-bar"
import { TaskGroup } from "@/components/tasks/task-group/task-group"
import { createTaskColumns } from "@/components/tasks/task-table/task-columns"
import { TasksEmptyState } from "@/components/tasks/tasks-empty-state"
import { TimeSummaryCards } from "@/components/tasks/time-summary/time-summary-cards"
import { DUMMY_TRACKED_TASKS } from "@/dummy-data/tracked-tasks"
import { useTrackedTasks } from "@/hooks/use-tracked-tasks"
import { getDictionary } from "@/i18n"
import { useTaskTimerStore } from "@/lib/task-timer-store"
import type { TrackedTask } from "@/models/task"

export function TasksPage({
  locale,
  tasks = DUMMY_TRACKED_TASKS,
}: {
  locale?: string
  tasks?: TrackedTask[]
}) {
  const dict = getDictionary(locale).tasksPage
  const [query, setQuery] = useState("")
  const stopTimer = useTaskTimerStore((state) => state.stop)
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
            <CreateButton label={dict.newTask} />
          </>
        }
      />

      <TimeSummaryCards
        todaySeconds={summary.todaySeconds}
        weekSeconds={summary.weekSeconds}
        labels={{
          today: dict.summary.today,
          week: dict.summary.week,
          unit: dict.hoursUnit,
        }}
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
    </div>
  )
}
