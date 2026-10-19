import { Label } from "@workspace/ui/components/label"

import { ERROR_ID, FIELD_ID } from "@/components/time-tracking/booking-form/booking-form-fields"
import { FieldMessage } from "@/components/time-tracking/booking-form/field-message"
import {
  FieldGroup,
  RequiredMark,
  type FormLabels,
} from "@/components/time-tracking/booking-form/form-layout"
import { ProjectCombobox } from "@/components/time-tracking/booking-form/project-combobox"
import type { Project } from "@/models/project"

export function ProjectField({
  projects,
  value,
  onChange,
  invalid,
  disabled,
  labels,
}: {
  projects: Project[]
  value: string | null
  onChange: (projectId: string | null) => void
  invalid: boolean
  disabled: boolean
  labels: FormLabels
}) {
  return (
    <FieldGroup>
      <Label htmlFor={FIELD_ID.project}>
        {labels.project}
        <RequiredMark label={labels.required} />
      </Label>
      <ProjectCombobox
        id={FIELD_ID.project}
        projects={projects}
        value={value}
        onChange={onChange}
        invalid={invalid}
        describedBy={invalid ? ERROR_ID.project : undefined}
        placeholder={labels.projectPlaceholder}
        emptyLabel={labels.projectEmpty}
        disabled={disabled}
      />
      {invalid && (
        <FieldMessage id={ERROR_ID.project} tone="error">
          {labels.validation.project}
        </FieldMessage>
      )}
    </FieldGroup>
  )
}
