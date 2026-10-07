import { HugeiconsIcon } from "@hugeicons/react"
import { PlayCircleIcon, StopCircleIcon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"

import type { TaskRow } from "@/models/task"
import type { Dictionary } from "@/i18n"
import { useTaskTimerStore } from "@/lib/task-timer-store"

export function TaskTimerButton({
  task,
  labels,
}: {
  task: TaskRow
  labels: Dictionary["tasksPage"]["timer"]
}) {
  const start = useTaskTimerStore((state) => state.start)
  const stop = useTaskTimerStore((state) => state.stop)
  const label = task.isRunning
    ? labels.stopTask
    : task.canStart
      ? labels.start
      : labels.locked
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      disabled={!task.isRunning && !task.canStart}
      onClick={() => (task.isRunning ? stop() : start(task.id))}
      className={
        task.isRunning
          ? "text-destructive hover:text-destructive"
          : "text-foreground"
      }
    >
      <HugeiconsIcon
        icon={task.isRunning ? StopCircleIcon : PlayCircleIcon}
        className="size-5"
      />
    </Button>
  )
}
