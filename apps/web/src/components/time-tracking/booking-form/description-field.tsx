import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import {
  DESCRIPTION_COUNTER_ID,
  ERROR_ID,
  FIELD_ID,
} from "@/components/time-tracking/booking-form/booking-form-fields"
import { FieldMessage } from "@/components/time-tracking/booking-form/field-message"
import { FieldGroup, type FormLabels } from "@/components/time-tracking/booking-form/form-layout"
import { DESCRIPTION_MAX_LENGTH } from "@/lib/time-tracking/booking-form"
import { fillTemplate } from "@/utils/fill-template"

/** Optionale Beschreibung mit Zeichenzähler und Längenlimit. */
export function DescriptionField({
  value,
  onChange,
  invalid,
  disabled,
  labels,
}: {
  value: string
  onChange: (description: string) => void
  invalid: boolean
  disabled: boolean
  labels: FormLabels
}) {
  return (
    <FieldGroup>
      <Label htmlFor={FIELD_ID.description}>{labels.description}</Label>
      <Textarea
        id={FIELD_ID.description}
        className="min-h-16"
        maxLength={DESCRIPTION_MAX_LENGTH}
        placeholder={labels.descriptionPlaceholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? ERROR_ID.description : DESCRIPTION_COUNTER_ID}
        disabled={disabled}
      />
      <p
        id={DESCRIPTION_COUNTER_ID}
        className="text-right text-xs text-muted-foreground tabular-nums"
      >
        {value.length}/{DESCRIPTION_MAX_LENGTH}
      </p>
      {invalid && (
        <FieldMessage id={ERROR_ID.description} tone="error">
          {fillTemplate(labels.validation.description, { max: DESCRIPTION_MAX_LENGTH })}
        </FieldMessage>
      )}
    </FieldGroup>
  )
}
