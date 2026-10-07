import { useEffect, useMemo } from "react"

import { useNow } from "@/hooks/use-now"
import { rehydrateTaskTimer, useTaskTimerStore } from "@/lib/task-timer-store"
import {
  TASK_GROUP_ORDER,
  buildTaskRows,
  getRunningSeconds,
  getTimeSummary,
  groupTasksByDue,
  matchesTaskQuery,
  type TaskGroupKey,
} from "@/lib/tracked-tasks"
import type { TaskRow, TrackedTask } from "@/models/task"

export type RunningTimer = {
  taskId: string
  task?: TrackedTask
  seconds: number
}

export function useTrackedTasks(tasks: TrackedTask[], query: string) {
  const active = useTaskTimerStore((state) => state.active)
  const bookedEntries = useTaskTimerStore((state) => state.entries)

  useEffect(() => rehydrateTaskTimer(), [])

  
  const now = useNow(active ? 1000 : 60_000)

  const openTasks = useMemo(() => tasks.filter((task) => !task.done), [tasks])

  const allEntries = useMemo(
    () => [...openTasks.flatMap((task) => task.timeEntries), ...bookedEntries],
    [openTasks, bookedEntries]
  )

  const runningSeconds = getRunningSeconds(active, now)

  const runningTimer: RunningTimer | null = active
    ? {
        taskId: active.taskId,
        task: openTasks.find((task) => task.id === active.taskId),
        seconds: runningSeconds,
      }
    : null

  const rows = buildTaskRows(
    openTasks.filter((task) => matchesTaskQuery(task, query)),
    allEntries,
    active,
    runningSeconds
  )
  const grouped = groupTasksByDue(rows, new Date(now))
  const groups: { key: TaskGroupKey; tasks: TaskRow[] }[] =
    TASK_GROUP_ORDER.map((key) => ({ key, tasks: grouped[key] })).filter(
      (group) => group.tasks.length > 0
    )

  return {
    openTaskCount: openTasks.length,
    summary: getTimeSummary(allEntries, active, now),
    runningTimer,
    groups,
  }
}
