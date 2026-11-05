import { Textarea } from "@workspace/ui/components/textarea"

import { FormField } from "@/components/settings/form-field"
import type { NewTaskFormState } from "@/hooks/use-new-task-form"
import { MAX_LENGTH } from "@/services/tasks/new-task.validation"
import { getFieldMessage, type TaskFormTexts } from "./form-helpers"

/** Mehrzeilige Beschreibung der Aufgabe. */
export function TaskDescriptionField({
  form,
  t,
}: {
  form: NewTaskFormState
  t: TaskFormTexts
}) {
  const code = form.errors.description

  return (
    <FormField
      label={t.taskDescription}
      error={getFieldMessage(code, "description", t.validation)}
      className="sm:col-span-2"
    >
      {(id, aria) => (
        <Textarea
          id={id}
          rows={4}
          maxLength={MAX_LENGTH.description}
          value={form.values.description}
          placeholder={t.placeholders.description}
          aria-invalid={code ? true : undefined}
          {...aria}
          onChange={(event) => form.setField("description", event.target.value)}
        />
      )}
    </FormField>
  )
}
