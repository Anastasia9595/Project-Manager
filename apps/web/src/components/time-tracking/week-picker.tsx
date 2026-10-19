import { useState } from "react"
import { de } from "react-day-picker/locale"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import type { Dictionary } from "@/i18n"
import { formatWeekLabel } from "@/lib/time-tracking/date-labels"
import { getWeekDays, startOfWeek } from "@/lib/week"
import { fillTemplate } from "@/utils/fill-template"

/** Wochenlabel „KW 42 · 12.–18. Okt. 2026“, das einen Datepicker öffnet. */
export function WeekPicker({
  weekStart,
  onSelectWeek,
  labels,
}: {
  weekStart: Date
  onSelectWeek: (weekStart: Date) => void
  labels: Dictionary["timeTrackingPage"]["weekNavigation"]
}) {
  const [open, setOpen] = useState(false)
  const label = formatWeekLabel(weekStart, labels.label)

  function selectDay(day: Date) {
    onSelectWeek(startOfWeek(day))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className="min-w-56 text-base font-semibold tabular-nums"
            aria-label={fillTemplate(labels.openPicker, { label })}
          />
        }
      >
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          required
          selected={weekStart}
          onSelect={selectDay}
          defaultMonth={weekStart}
          locale={de}
          ISOWeek
          showWeekNumber
          formatters={{ formatWeekNumberHeader: () => labels.weekNumberHeader }}
          labels={{ labelWeekNumberHeader: () => labels.weekNumberLabel }}
          modifiers={{ selectedWeek: getWeekDays(weekStart) }}
          modifiersClassNames={{ selectedWeek: "bg-secondary" }}
        />
      </PopoverContent>
    </Popover>
  )
}
