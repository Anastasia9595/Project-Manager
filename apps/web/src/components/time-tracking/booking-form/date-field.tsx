import { Label } from "@workspace/ui/components/label"

import { BookingDatePicker } from "@/components/time-tracking/booking-form/booking-date-picker"
import { FIELD_ID } from "@/components/time-tracking/booking-form/booking-form-fields"
import {
  FieldGroup,
  RequiredMark,
  type FormLabels,
} from "@/components/time-tracking/booking-form/form-layout"

export function DateField({
  value,
  onChange,
  bookableDays,
  disabled,
  labels,
}: {
  value: string
  onChange: (dayKey: string) => void
  bookableDays: Date[]
  disabled: boolean
  labels: FormLabels
}) {
  return (
    <FieldGroup>
      <Label htmlFor={FIELD_ID.date}>
        {labels.date}
        <RequiredMark label={labels.required} />
      </Label>
      <BookingDatePicker
        id={FIELD_ID.date}
        value={value}
        onChange={onChange}
        bookableDays={bookableDays}
        disabled={disabled}
      />
    </FieldGroup>
  )
}
