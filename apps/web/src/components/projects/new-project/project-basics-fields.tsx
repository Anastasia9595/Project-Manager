import { useMemo } from "react"

import { FormGrid } from "@/components/settings/form-field"
import type { NewProjectFormState } from "@/hooks/use-new-project-form"
import type { ProjectOptions } from "@/services/projects/new-project.types"
import { MAX_LENGTH } from "@/services/projects/new-project.validation"
import {
  getDependentPlaceholder,
  toSelectOptions,
  toTenantUserOptions,
  toVariantOptions,
  type ProjectFormTexts,
} from "./form-helpers"
import { ProjectSelectField } from "./project-select-field"
import { ProjectTextField } from "./project-text-field"

/** Abschnitt "Projekt": Name, Kunde, Kontaktperson, Medientyp, Variante, Druckerei und Auflage. */
export function ProjectBasicsFields({
  form,
  options,
  t,
}: {
  form: NewProjectFormState
  options: ProjectOptions
  t: ProjectFormTexts
}) {
  const { values } = form
  const p = t.placeholders
  const lists = useMemo(
    () => ({
      tenants: toSelectOptions(options.tenants),
      mediaTypes: toSelectOptions(options.mediaTypes),
      printingCompanies: toSelectOptions(options.printingCompanies),
    }),
    [options]
  )
  const tenantUsers = useMemo(
    () => toTenantUserOptions(options, values.tenantId),
    [options, values.tenantId]
  )
  const variants = useMemo(
    () => toVariantOptions(options, values.mediaTypeId),
    [options, values.mediaTypeId]
  )

  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-2 text-base font-semibold">
        {t.projectSection}
      </legend>
      <FormGrid>
        <ProjectTextField
          form={form}
          t={t}
          name="name"
          label={t.name}
          placeholder={p.name}
          maxLength={MAX_LENGTH.name}
          required
          autoFocus
          className="sm:col-span-2"
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="tenantId"
          label={t.tenant}
          options={lists.tenants}
          placeholder={p.tenant}
          onValueChange={form.setTenant}
          required
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="tenantUserId"
          label={t.tenantUser}
          options={tenantUsers}
          placeholder={getDependentPlaceholder(
            values.tenantId,
            tenantUsers.length,
            {
              needsParent: p.tenantUserNeedsTenant,
              none: p.tenantUserNone,
              choose: p.tenantUser,
            }
          )}
          emptyLabel={p.tenantUserEmpty}
          disabled={tenantUsers.length === 0}
          onValueChange={(next) => form.setField("tenantUserId", next)}
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="mediaTypeId"
          label={t.mediaType}
          options={lists.mediaTypes}
          placeholder={p.mediaType}
          onValueChange={form.setMediaType}
          required
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="variantId"
          label={t.variant}
          options={variants}
          placeholder={getDependentPlaceholder(
            values.mediaTypeId,
            variants.length,
            {
              needsParent: p.variantNeedsMediaType,
              none: p.variantNone,
              choose: p.variant,
            }
          )}
          disabled={variants.length === 0}
          onValueChange={(next) => form.setField("variantId", next)}
          required
        />
        <ProjectSelectField
          form={form}
          t={t}
          name="printingCompanyId"
          label={t.printingCompany}
          options={lists.printingCompanies}
          placeholder={p.printingCompany}
          onValueChange={(next) => form.setField("printingCompanyId", next)}
          required
        />
        <ProjectTextField
          form={form}
          t={t}
          name="circulation"
          label={t.circulation}
          placeholder={p.circulation}
          inputMode="numeric"
          required
        />
      </FormGrid>
    </fieldset>
  )
}
