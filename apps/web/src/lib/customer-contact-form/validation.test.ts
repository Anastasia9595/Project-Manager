import { describe, expect, it } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"

const valid = {
  ...EMPTY_CUSTOMER_CONTACT_VALUES,
  firstName: "Anna",
  lastName: "Muster",
  tenantId: "tenant-1",
}

describe("validateCustomerContact", () => {
  it("meldet fehlende Pflichtfelder", () => {
    expect(validateCustomerContact(EMPTY_CUSTOMER_CONTACT_VALUES)).toEqual({
      firstName: "required",
      lastName: "required",
      tenantId: "required",
    })
  })

  it("behandelt Leerzeichen als leer", () => {
    expect(
      validateCustomerContact({ ...valid, firstName: "   " })
    ).toEqual({ firstName: "required" })
  })

  it("akzeptiert Werte ohne optionale Felder", () => {
    expect(validateCustomerContact(valid)).toEqual({})
  })

  it("prüft die E-Mail nur, wenn sie ausgefüllt ist", () => {
    expect(validateCustomerContact({ ...valid, email: "" })).toEqual({})
    expect(validateCustomerContact({ ...valid, email: "kein-mail" })).toEqual({
      email: "invalidEmail",
    })
    expect(
      validateCustomerContact({ ...valid, email: "anna@example.com" })
    ).toEqual({})
  })
})
