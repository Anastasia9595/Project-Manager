import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import {
  DURATION_TOTAL_ID,
  ERROR_ID,
  FIELD_ID,
} from "@/components/time-tracking/booking-form/booking-form-fields"
import { FieldMessage } from "@/components/time-tracking/booking-form/field-message"
import {
  FieldGroup,
  FieldSet,
  RequiredMark,
  type FormLabels,
} from "@/components/time-tracking/booking-form/form-layout"
import { MINUTES_PER_HOUR, formatDuration } from "@/lib/time-tracking/calculations/duration"
import { DAILY_LIMIT_MINUTES, exceedsDailyLimit } from "@/lib/time-tracking/calculations/totals"
import {
  MAX_MINUTES_INPUT,
  durationMinutes,
  type DurationError,
  type DurationInput,
} from "@/lib/time-tracking/duration-input"
import { fillTemplate } from "@/utils/fill-template"

/** Stunden + Minuten, darunter „Gesamt: 3:00 h“, Fehler und Hinweis ab 10 h/Tag. */
export function DurationField({
  value,
  onChange,
  error,
  otherMinutesOnDate,
  disabled,
  labels,
}: {
  value: DurationInput
  onChange: (patch: Partial<DurationInput>) => void
  error: DurationError | undefined
  /** Bereits gebuchte Minuten am gewählten Tag (ohne den bearbeiteten Eintrag). */
  otherMinutesOnDate: number
  disabled: boolean
  labels: FormLabels
}) {
  const minutes = durationMinutes(value)
  const describedBy = error ? `${DURATION_TOTAL_ID} ${ERROR_ID.duration}` : DURATION_TOTAL_ID
  const inputProps = {
    type: "number",
    inputMode: "numeric",
    min: 0,
    step: 1,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    disabled,
  } as const

  return (
    <FieldSet
      legend={
        <>
          {labels.duration}
          <RequiredMark label={labels.required} />
        </>
      }
      describedBy={error ? ERROR_ID.duration : undefined}
    >
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label htmlFor={FIELD_ID.hours} className="text-xs">
            {labels.hours}
          </Label>
          <Input
            id={FIELD_ID.hours}
            placeholder="0"
            value={value.hours}
            onChange={(event) => onChange({ hours: event.target.value })}
            {...inputProps}
          />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor={FIELD_ID.minutes} className="text-xs">
            {labels.minutes}
          </Label>
          <Input
            id={FIELD_ID.minutes}
            max={MAX_MINUTES_INPUT}
            placeholder="00"
            value={value.minutes}
            onChange={(event) => onChange({ minutes: event.target.value })}
            {...inputProps}
          />
        </FieldGroup>
      </div>
      <p id={DURATION_TOTAL_ID} className="text-xs text-muted-foreground" aria-live="polite">
        {fillTemplate(labels.total, { duration: formatDuration(minutes) })}
      </p>
      {error && (
        <FieldMessage id={ERROR_ID.duration} tone="error">
          {error === "invalid" ? labels.validation.durationInvalid : labels.validation.duration}
        </FieldMessage>
      )}
      {exceedsDailyLimit(otherMinutesOnDate + minutes) && (
        <FieldMessage tone="warning">
          {fillTemplate(labels.validation.dailyLimit, {
            hours: DAILY_LIMIT_MINUTES / MINUTES_PER_HOUR,
          })}
        </FieldMessage>
      )}
    </FieldSet>
  )
}
