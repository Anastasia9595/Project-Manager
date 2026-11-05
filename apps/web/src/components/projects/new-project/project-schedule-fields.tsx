import { useMemo } from "react"

import { FormGrid } from "@/components/settings/form-field"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import { toDayKey } from "@/lib/week"
import {
  DELIVERY_TYPES,
  isDeliveryType,
} from "@/services/projects/new-project.values"
import type { ProjectFormTexts } from "./form-helpers"
import { ProjectSelectField } from "./project-select-field"
import { ProjectTextField } from "./project-text-field"

/** Abschnitt "Termine": PAL-Datum, Pufferzeit, Lieferart und die übrigen Daten. */
export function ProjectScheduleFields({
  form,
  t,
}: {
  form: NewProjectFormState
  t: ProjectFormTexts
}) {
  const deliveryTypes = useMemo(
    () =>
      DELIVERY_TYPES.map((type) => ({
        value: type,
        label: t.deliveryTypes[type],
      })),
    [t.deliveryTypes]
  )

  return (
    <fieldset className="flex flex-col gap-4 border-t border-border pt-8">
      <legend className="mb-2 text-base font-semibold">
        {t.scheduleSection}
      </legend>
      <FormGrid>
        <ProjectTextField
          form={form}
          t={t}
          name="palDate"
          type="date"
          label={t.palDate}
          min={toDayKey(new Date())}
          required
        />
        <ProjectTextField
          form={form}
          t={t}
          name="bufferDays"
          label={t.bufferDays}
          placeholder={t.placeholders.bufferDays}
          inputMode="numeric"
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="deliveryType"
          label={t.deliveryType}
          options={deliveryTypes}
          placeholder={t.placeholders.deliveryType}
          emptyLabel={t.placeholders.deliveryTypeEmpty}
          onValueChange={(next) =>
            form.setField("deliveryType", isDeliveryType(next) ? next : "")
          }
        />
        <ProjectTextField
          form={form}
          t={t}
          name="deliveryDate"
          type="date"
          label={t.deliveryDate}
        />
        <ProjectTextField
          form={form}
          t={t}
          name="distributionDate"
          type="date"
          label={t.distributionDate}
        />
        <ProjectTextField
          form={form}
          t={t}
          name="validUntil"
          type="date"
          label={t.validUntil}
        />
      </FormGrid>
    </fieldset>
  )
}
