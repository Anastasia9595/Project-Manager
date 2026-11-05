import { Textarea } from "@workspace/ui/components/textarea"

import { FormField, FormGrid } from "@/components/settings/form-field"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import { MAX_LENGTH } from "@/services/projects/new-project.validation"
import { getFieldMessage, type ProjectFormTexts } from "./form-helpers"

/** Abschnitt "Texte": Beschreibung und interne Notizen. */
export function ProjectNotesFields({
  form,
  t,
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
}) {
  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
      <legend className="mb-2 text-base font-semibold">{t.textsSection}</legend>
      <FormGrid>
        <NotesField
          form={form}
          t={t}
          name="description"
          label={t.projectDescription}
        />
        <NotesField
          form={form}
          t={t}
          name="internalNotes"
          label={t.internalNotes}
        />
      </FormGrid>
    </fieldset>
  )
}

function NotesField({
  form,
  t,
  name,
  label,
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
  name: "description" | "internalNotes"
  label: string
}) {
  const code = form.errors[name]

  return (
    <FormField
      label={label}
      error={getFieldMessage(code, name, t.validation)}
      className="sm:col-span-2"
    >
      {(id, aria) => (
        <Textarea
          id={id}
          rows={4}
          maxLength={MAX_LENGTH[name]}
          value={form.values[name]}
          placeholder={t.placeholders[name]}
          aria-invalid={code ? true : undefined}
          {...aria}
          onChange={(event) => form.setField(name, event.target.value)}
        />
      )}
    </FormField>
  )
}
