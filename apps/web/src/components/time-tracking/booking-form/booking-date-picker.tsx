import { useState } from "react"
import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { de } from "react-day-picker/locale"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import { formatBookingDate } from "@/lib/time-tracking/date-labels"
import { parseDayKey, toDayKey } from "@/lib/week"

/** Datumsauswahl, beschränkt auf die buchbaren Tage (`bookableDays`). */
export function BookingDatePicker({
  id,
  value,
  onChange,
  bookableDays,
  disabled,
}: {
  id: string
  /** Tag als `toDayKey`. */
  value: string
  onChange: (dayKey: string) => void
  bookableDays: Date[]
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = parseDayKey(value)
  const bookableKeys = new Set(bookableDays.map(toDayKey))

  function select(day: Date) {
    onChange(toDayKey(day))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            className="w-full justify-start font-normal"
            disabled={disabled}
          />
        }
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          strokeWidth={2}
          className="text-muted-foreground"
          aria-hidden
        />
        <span className="flex-1 text-left">{formatBookingDate(selected)}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          strokeWidth={2}
          className="text-muted-foreground"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          required
          selected={selected}
          onSelect={select}
          defaultMonth={selected}
          locale={de}
          ISOWeek
          disabled={(day) => !bookableKeys.has(toDayKey(day))}
        />
      </PopoverContent>
    </Popover>
  )
}
