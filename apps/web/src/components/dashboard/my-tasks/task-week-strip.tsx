import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"

import { addDays, formatMonthYear, getWeekDays, isSameDay } from "@/lib/week"
import { TaskDayChip } from "./task-day-chip"

type TaskWeekStripProps = {
  weekStart: Date
  selectedDate: Date
  today: Date
  onSelectDate: (date: Date) => void
  onChangeWeek: (weekStart: Date) => void
}

export function TaskWeekStrip({
  weekStart,
  selectedDate,
  today,
  onSelectDate,
  onChangeWeek,
}: TaskWeekStripProps) {
  const days = getWeekDays(weekStart)
  // Mitte der Woche bestimmt den Monat, damit Wochen über den Monatswechsel ruhig bleiben.
  const monthDate = days[3]!

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">{formatMonthYear(monthDate)}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label="Vorherige Woche"
            onClick={() => onChangeWeek(addDays(weekStart, -7))}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            className="rounded-full"
            aria-label="Nächste Woche"
            onClick={() => onChangeWeek(addDays(weekStart, 7))}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          </Button>
        </div>
      </div>
      <div className="flex gap-2">
        {days.map((day) => (
          <TaskDayChip
            key={day.toISOString()}
            date={day}
            isSelected={isSameDay(day, selectedDate)}
            isToday={isSameDay(day, today)}
            onSelect={onSelectDate}
          />
        ))}
      </div>
    </div>
  )
}
