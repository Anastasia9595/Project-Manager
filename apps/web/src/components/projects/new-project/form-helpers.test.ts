import { describe, expect, it } from "vitest"

import { getDictionary } from "@/i18n"
import type { ProjectOptions } from "@/services/projects/new-project.types"
import {
  getDependentPlaceholder,
  getFieldMessage,
  getSubmitErrorMessage,
  toTenantUserOptions,
  toVariantOptions,
} from "./form-helpers"

const t = getDictionary("de").projectsPage.form

const options: ProjectOptions = {
  tenants: [],
  tenantUsers: [
    { id: "1", name: "Anna Muster", tenant: "t1" },
    { id: "2", name: "Ben Beispiel", tenant: "t2" },
  ],
  mediaTypes: [],
  variants: [
    { id: "v1", name: "A4", mediaType: "m1" },
    { id: "v2", name: "A5", mediaType: "m2" },
    { id: "v3", name: "Ohne Typ", mediaType: null },
  ],
  printingCompanies: [],
}

describe("abhängige Auswahllisten", () => {
  it("zeigt nur Kontaktpersonen des gewählten Kunden", () => {
    expect(toTenantUserOptions(options, "t1")).toEqual([
      { value: "1", label: "Anna Muster" },
    ])
    expect(toTenantUserOptions(options, "")).toEqual([])
  })

  it("zeigt nur Varianten des gewählten Medientyps", () => {
    expect(toVariantOptions(options, "m2")).toEqual([
      { value: "v2", label: "A5" },
    ])
    expect(toVariantOptions(options, "")).toEqual([])
  })

  it("wählt den Platzhalter nach Elternauswahl und Trefferzahl", () => {
    const texts = { needsParent: "zuerst", none: "keine", choose: "wählen" }
    expect(getDependentPlaceholder("", 0, texts)).toBe("zuerst")
    expect(getDependentPlaceholder("t1", 0, texts)).toBe("keine")
    expect(getDependentPlaceholder("t1", 2, texts)).toBe("wählen")
  })
})

describe("getFieldMessage", () => {
  it("bildet Codes je Feld auf Meldungen ab", () => {
    const v = t.validation
    expect(getFieldMessage("required", "palDate", v)).toBe(v.required.palDate)
    expect(getFieldMessage("required", "bufferDays", v)).toBeUndefined()
    expect(getFieldMessage("invalid", "circulation", v)).toBe(
      v.invalidCirculation
    )
    expect(getFieldMessage("invalid", "bufferDays", v)).toBe(
      v.invalidBufferDays
    )
    expect(getFieldMessage("invalid", "validUntil", v)).toBe(v.invalidDate)
    expect(getFieldMessage("invalid", "variantId", v)).toBe(v.invalid)
    expect(getFieldMessage("pastDate", "palDate", v)).toBe(v.pastDate)
    expect(getFieldMessage("tooLong", "description", v)).toBe(v.tooLong)
    expect(getFieldMessage(undefined, "name", v)).toBeUndefined()
  })
})

describe("getSubmitErrorMessage", () => {
  it("bildet API-Fehlercodes auf Meldungen ab", () => {
    const e = t.errors
    expect(getSubmitErrorMessage("unauthorized", e)).toBe(e.sessionExpired)
    expect(getSubmitErrorMessage("forbidden", e)).toBe(e.forbidden)
    expect(getSubmitErrorMessage("invalid_variant", e)).toBe(e.invalidVariant)
    expect(getSubmitErrorMessage("invalid_contact", e)).toBe(e.invalidContact)
    expect(getSubmitErrorMessage("network_error", e)).toBe(e.timeout)
    expect(getSubmitErrorMessage("server_error", e)).toBe(e.saveError)
  })
})
