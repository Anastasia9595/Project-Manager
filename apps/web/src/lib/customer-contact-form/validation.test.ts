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

  it("begrenzt die Länge der Felder", () => {
    expect(
      validateCustomerContact({ ...valid, firstName: "a".repeat(101) })
    ).toEqual({ firstName: "tooLong" })
    expect(
      validateCustomerContact({ ...valid, firstName: "a".repeat(100) })
    ).toEqual({})
    expect(
      validateCustomerContact({
        ...valid,
        email: `${"a".repeat(250)}@b.de`,
        notes: "a".repeat(2001),
      })
    ).toEqual({ email: "tooLong", notes: "tooLong" })
  })

  it("misst die Länge am Rohwert wie das maxLength-Attribut", () => {
    // 2000 Zeichen plus Leerzeichen am Ende: der Browser lässt das nicht zu, der Server lehnt es ebenfalls ab.
    expect(
      validateCustomerContact({ ...valid, notes: `${"a".repeat(2000)} ` })
    ).toEqual({ notes: "tooLong" })
    expect(
      validateCustomerContact({ ...valid, notes: "a".repeat(2000) })
    ).toEqual({})
    expect(
      validateCustomerContact({ ...valid, notes: "a\r\nb".repeat(500) })
    ).toEqual({})
  })

  it("prüft Telefon und Mobil nur, wenn sie ausgefüllt sind", () => {
    expect(
      validateCustomerContact({ ...valid, phone: "", mobile: "  " })
    ).toEqual({})
    expect(
      validateCustomerContact({
        ...valid,
        phone: "0561 123456",
        mobile: "+49 170 1234567",
      })
    ).toEqual({})
    expect(
      validateCustomerContact({ ...valid, phone: "abc", mobile: "12" })
    ).toEqual({ phone: "invalidPhone", mobile: "invalidPhone" })
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
