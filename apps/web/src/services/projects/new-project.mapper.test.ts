import { describe, expect, it } from "vitest"

import {
  nextProjectNumber,
  submissionPalDate,
  toPrintingLinePayload,
  toProjectOptions,
  toSubmissionPayload,
} from "@/services/projects/new-project.mapper"
import type { ProjectLookup } from "@/services/projects/new-project.types"
import {
  EMPTY_NEW_PROJECT_VALUES,
  type NewProjectValues,
} from "@/services/projects/new-project.values"

const values: NewProjectValues = {
  ...EMPTY_NEW_PROJECT_VALUES,
  name: "  Flyer  ",
  tenantId: "t-uuid",
  tenantUserId: "7",
  mediaTypeId: "m-uuid",
  variantId: "v-uuid",
  printingCompanyId: "3",
  circulation: "30000",
  palDate: "2026-11-05",
  bufferDays: "2",
  deliveryType: "pal",
  description: " Text ",
}
const lookup: ProjectLookup = {
  tenantName: "Weber",
  mediaTypeCategory: "print",
  variantMediaType: "m-uuid",
  contactTenant: "t-uuid",
}
const base = { values, userId: "u1", lookup, today: "2026-11-05" }

describe("nextProjectNumber", () => {
  it("startet bei 001", () => {
    expect(nextProjectNumber([], 2026)).toBe("P-2026-001")
  })
  it("zaehlt die hoechste Nummer des Jahres hoch", () => {
    expect(
      nextProjectNumber(
        ["P-2026-009", "P-2026-031", "P-2025-099", null, "x"],
        2026
      )
    ).toBe("P-2026-032")
  })
})

describe("submissionPalDate", () => {
  it("nimmt das spaetere Datum", () => {
    expect(submissionPalDate("2026-12-01", "2026-11-05")).toBe("2026-12-01")
    expect(submissionPalDate("2026-11-05", "2026-11-05")).toBe("2026-11-06")
    expect(submissionPalDate("2026-11-30", "2026-11-30")).toBe("2026-12-01")
  })
})

describe("payloads", () => {
  it("baut die Einreichung", () => {
    expect(toSubmissionPayload(base)).toEqual({
      status: "approved",
      customer_company: "Weber",
      submitted_by: 7,
      selected_medium: "m-uuid",
      selected_variant: "v-uuid",
      medium_category: "print",
      circulation: 30000,
      assigned_printer: 3,
      assigned_contact: "u1",
      layout_choice: "orange_individual",
      pal_date: "2026-11-06",
    })
  })
  it("setzt submitted_by auf null ohne Kontaktperson", () => {
    const payload = toSubmissionPayload({
      ...base,
      values: { ...values, tenantUserId: "" },
    })
    expect(payload.submitted_by).toBeNull()
  })
  it("baut die Druckstrecke", () => {
    expect(
      toPrintingLinePayload({
        ...base,
        submissionId: "s1",
        projectNumber: "P-2026-001",
      })
    ).toEqual({
      name: "Flyer",
      status: "created",
      project_number: "P-2026-001",
      project_description: "Text",
      internal_notes: null,
      tenant: "t-uuid",
      tenant_user: 7,
      printing_company: 3,
      media_type: "m-uuid",
      variant: "v-uuid",
      category: "print",
      assigned_contact: "u1",
      delivery_type: "pal",
      circulation: 30000,
      buffer_days: 2,
      pal_date: "2026-11-05",
      delivery_date: null,
      distribution_date: null,
      valid_until: null,
      form_submission: "s1",
    })
  })
})

describe("toProjectOptions", () => {
  it("bildet Namen und String-Ids", () => {
    expect(
      toProjectOptions({
        tenants: [{ id: "t1", tenant_name: null }],
        tenantUsers: [
          { id: 7, first_name: "Anna", last_name: null, tenant: "t1" },
        ],
        mediaTypes: [{ id: "m1", name: "Flyer" }],
        variants: [{ id: "v1", name: "A5", product: "m1" }],
        printingCompanies: [
          { id: 3, company_name: "Druck", company_suffix: "GmbH" },
          { id: 4, company_name: "Test", company_suffix: null },
        ],
      })
    ).toEqual({
      tenants: [{ id: "t1", name: "" }],
      tenantUsers: [{ id: "7", name: "Anna", tenant: "t1" }],
      mediaTypes: [{ id: "m1", name: "Flyer" }],
      variants: [{ id: "v1", name: "A5", mediaType: "m1" }],
      printingCompanies: [
        { id: "3", name: "Druck GmbH" },
        { id: "4", name: "Test" },
      ],
    })
  })
})
