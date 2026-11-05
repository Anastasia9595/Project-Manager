import { useState } from "react"
import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { de, enUS } from "react-day-picker/locale"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"

import type { FieldAria } from "@/components/settings/form-field"
import { parseDayKey, toDayKey } from "@/lib/week"
import { formatPickerDate, isBeforeMinDate } from "./date-picker-helpers"

/** Datumsfeld mit Kalender-Popover; Wert ist "" oder YYYY-MM-DD. */
export function DatePicker({
  id,
  value,
  onChange,
  placeholder,
  clearLabel,
  minDate,
  disabled,
  invalid,
  aria,
  locale,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Mit Label und gesetztem Wert erscheint eine Aktion zum Leeren. */
  clearLabel?: string
  minDate?: string
  disabled?: boolean
  invalid?: boolean
  aria?: FieldAria
  locale?: string
}) {
  const [open, setOpen] = useState(false)
  const selected = value ? parseDayKey(value) : undefined

  function select(day: Date | undefined) {
    if (!day) return
    onChange(toDayKey(day))
    setOpen(false)
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              className="h-12 w-full justify-start px-3 font-normal"
              disabled={disabled}
              aria-invalid={invalid ? true : undefined}
              {...aria}
            />
          }
        >
          <HugeiconsIcon
            icon={Calendar03Icon}
            strokeWidth={2}
            className="text-muted-foreground"
            aria-hidden
          />
          <span className={cn(!value && "text-muted-foreground")}>
            {value ? formatPickerDate(value, locale) : placeholder}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={select}
            defaultMonth={
              selected ?? (minDate ? parseDayKey(minDate) : new Date())
            }
            locale={locale === "de" ? de : enUS}
            ISOWeek
            disabled={(day) => isBeforeMinDate(day, minDate)}
          />
        </PopoverContent>
      </Popover>
      {clearLabel && value && !disabled && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={() => onChange("")}
        >
          {clearLabel}
        </button>
      )}
    </div>
  )
}
