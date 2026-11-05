import { describe, expect, it } from "vitest"
import { isNewProjectValues, type NewProjectValues } from "./new-project.values"
import { validateNewProject } from "./new-project.validation"

const UUID = "00000000-0000-4000-8000-000000000001"
const TODAY = "2026-11-05"

const valid = (): NewProjectValues => ({
  name: "Test",
  tenantId: UUID,
  tenantUserId: "",
  mediaTypeId: "00000000-0000-4000-8000-000000000002",
  variantId: "00000000-0000-4000-8000-000000000003",
  printingCompanyId: "3",
  circulation: "10000",
  palDate: "2026-12-01",
  bufferDays: "",
  deliveryType: "",
  deliveryDate: "",
  distributionDate: "",
  validUntil: "",
  description: "",
  internalNotes: "",
})

const check = (changes: Partial<NewProjectValues>) =>
  validateNewProject({ ...valid(), ...changes }, TODAY)

describe("validateNewProject", () => {
  it("accepts valid values", () => {
    expect(validateNewProject(valid(), TODAY)).toEqual({})
  })

  it.each([
    "name",
    "tenantId",
    "mediaTypeId",
    "variantId",
    "printingCompanyId",
    "circulation",
    "palDate",
  ] as const)("requires %s", (key) => {
    expect(check({ [key]: "" })).toEqual({ [key]: "required" })
  })

  it("treats a blank name as required", () => {
    expect(check({ name: "   " })).toEqual({ name: "required" })
  })

  it("checks palDate", () => {
    expect(check({ palDate: "2026-11-04" })).toEqual({ palDate: "pastDate" })
    expect(check({ palDate: TODAY })).toEqual({})
    expect(check({ palDate: "2026-02-30" })).toEqual({ palDate: "invalid" })
  })

  it("checks circulation", () => {
    for (const circulation of ["0", "abc", "10000001"]) {
      expect(check({ circulation })).toEqual({ circulation: "invalid" })
    }
  })

  it("checks bufferDays", () => {
    expect(check({ bufferDays: "366" })).toEqual({ bufferDays: "invalid" })
    expect(check({ bufferDays: "" })).toEqual({})
  })

  it("checks ids, optional dates and deliveryType", () => {
    expect(check({ tenantId: "abc" })).toEqual({ tenantId: "invalid" })
    expect(check({ tenantUserId: "x" })).toEqual({ tenantUserId: "invalid" })
    expect(check({ tenantUserId: "9999999999" })).toEqual({
      tenantUserId: "invalid",
    })
    expect(check({ tenantUserId: "123456789" })).toEqual({})
    expect(check({ printingCompanyId: "9999999999" })).toEqual({
      printingCompanyId: "invalid",
    })
    expect(check({ printingCompanyId: "123456789" })).toEqual({})
    expect(check({ deliveryDate: "2026-13-01" })).toEqual({
      deliveryDate: "invalid",
    })
    expect(check({ deliveryType: "x" as never })).toEqual({
      deliveryType: "invalid",
    })
  })

  it("checks lengths", () => {
    expect(check({ name: "a".repeat(201) })).toEqual({ name: "tooLong" })
    expect(check({ description: "a".repeat(2001) })).toEqual({
      description: "tooLong",
    })
  })
})

describe("isNewProjectValues", () => {
  it("accepts valid values", () => {
    expect(isNewProjectValues(valid())).toBe(true)
  })

  it("rejects bad input", () => {
    const missing: Partial<NewProjectValues> = valid()
    delete missing.name
    expect(isNewProjectValues(missing)).toBe(false)
    expect(isNewProjectValues({ ...valid(), deliveryType: "x" })).toBe(false)
    expect(isNewProjectValues(null)).toBe(false)
  })
})
