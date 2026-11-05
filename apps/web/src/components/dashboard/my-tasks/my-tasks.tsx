"use client"

import { Toaster } from "@workspace/ui/components/sonner"
import { useState } from "react"

import { useTaskCompletion } from "@/hooks/use-task-completion"
import { sortByPriority } from "@/lib/tasks"
import { formatDayLabel, isSameDay, startOfWeek } from "@/lib/week"
import type { Task } from "@/models/task"
import { TaskListItem } from "./task-list-item"
import { TaskWeekStrip } from "./task-week-strip"

type MyTasksProps = {
  tasks: Task[]
  saveError: string
  className?: string
}

export function MyTasks({
  tasks: initialTasks,
  saveError,
  className = "",
}: MyTasksProps) {
  const saveCompletion = useTaskCompletion(saveError)
  const [today] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(today)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))
  const [tasks, setTasks] = useState(initialTasks)

  const isToday = isSameDay(selectedDate, today)
  const visibleTasks = sortByPriority(
    tasks.filter((task) => isSameDay(task.dueDate, selectedDate))
  )

  function flipTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, done: !task.done } : task
      )
    )
  }

  function toggleTask(id: string) {
    const task = tasks.find((candidate) => candidate.id === id)
    if (!task) return
    flipTask(id)
    void saveCompletion(id, !task.done, () => flipTask(id))
  }

  return (
    <section
      className={`flex flex-col gap-6 rounded-3xl border border-border bg-card p-6 ${className}`}
    >
      <h2 className="text-xl font-bold text-foreground">Meine Aufgaben</h2>
      <TaskWeekStrip
        weekStart={weekStart}
        selectedDate={selectedDate}
        today={today}
        onSelectDate={setSelectedDate}
        onChangeWeek={setWeekStart}
      />
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">
            {isToday
              ? "Aufgaben für heute"
              : `Aufgaben für ${formatDayLabel(selectedDate)}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            Sortiert nach Priorität (Hoch → Niedrig)
          </p>
        </div>
        {visibleTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Aufgaben für diesen Tag.
          </p>
        ) : (
          <ul className="flex max-h-96 min-h-0 flex-col gap-3 overflow-y-auto lg:max-h-none lg:flex-1">
            {visibleTasks.map((task) => (
              <TaskListItem key={task.id} task={task} onToggle={toggleTask} />
            ))}
          </ul>
        )}
      </div>
      <Toaster />
    </section>
  )
}
