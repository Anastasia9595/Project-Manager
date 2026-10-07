import { Button } from "@workspace/ui/components/button"

import { Card } from "@/components/shared/card"
import { formatClock } from "@/lib/tracked-tasks"

export function RunningTimerBar({
  taskTitle,
  projectName,
  seconds,
  onStop,
  labels,
}: {
  taskTitle: string
  projectName: string
  seconds: number
  onStop: () => void
  labels: { running: string; stop: string }
}) {
  return (
    <Card className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
      <p className="min-w-0 truncate text-sm text-muted-foreground">
        <span className="text-foreground">{labels.running}</span>{" "}
        <span className="font-semibold text-foreground">{taskTitle}</span> ·{" "}
        {projectName}
      </p>
      <div className="flex items-center gap-6">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          {formatClock(seconds)}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onStop}
          className="rounded-lg bg-card text-foreground"
        >
          <span
            aria-hidden
            data-icon="inline-start"
            className="size-2.5 rounded-xs bg-destructive"
          />
          {labels.stop}
        </Button>
      </div>
    </Card>
  )
}
