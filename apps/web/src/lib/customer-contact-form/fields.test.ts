import { describe, expect, it } from "vitest"

import {
  EMPTY_CUSTOMER_CONTACT_VALUES,
  isCustomerContactValues,
  toDirectusPayload,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"

const TENANT_ID = "11111111-1111-4111-8111-111111111111"
const LOCATION_ID = "22222222-2222-4222-8222-222222222222"

const filled: CustomerContactValues = {
  firstName: "  Anna ",
  lastName: "Muster",
  tenantId: TENANT_ID,
  locationId: LOCATION_ID,
  position: "buchhaltung",
  isActive: false,
  email: "anna@example.com",
  phone: "0561 123",
  mobile: "0170 456",
  preferredContact: "mobile",
  notes: "Nur vormittags",
}

describe("toDirectusPayload", () => {
  it("ordnet die Formularfelder den Directus-Feldern zu", () => {
    expect(toDirectusPayload(filled)).toEqual({
      first_name: "Anna",
      last_name: "Muster",
      tenant: TENANT_ID,
      locations: LOCATION_ID,
      positions: "buchhaltung",
      is_active: false,
      email: "anna@example.com",
      phone: "0561 123",
      mobile: "0170 456",
      preferred_contact: "mobile",
      notes: "Nur vormittags",
    })
  })

  it("sendet leere optionale Felder als null", () => {
    const payload = toDirectusPayload({
      ...EMPTY_CUSTOMER_CONTACT_VALUES,
      firstName: "Anna",
      lastName: "Muster",
      tenantId: "tenant-1",
    })
    expect(payload).toEqual({
      first_name: "Anna",
      last_name: "Muster",
      tenant: "tenant-1",
      locations: null,
      positions: null,
      is_active: true,
      email: null,
      phone: null,
      mobile: null,
      preferred_contact: null,
      notes: null,
    })
  })
})

describe("isCustomerContactValues", () => {
  it("akzeptiert vollständige Werte", () => {
    expect(isCustomerContactValues(filled)).toBe(true)
    expect(isCustomerContactValues(EMPTY_CUSTOMER_CONTACT_VALUES)).toBe(true)
  })

  it("lehnt fehlende oder falsch typisierte Felder ab", () => {
    expect(isCustomerContactValues(null)).toBe(false)
    expect(isCustomerContactValues("text")).toBe(false)
    expect(isCustomerContactValues({ ...filled, firstName: 1 })).toBe(false)
    expect(isCustomerContactValues({ ...filled, isActive: "true" })).toBe(false)
    const withoutNotes: Partial<CustomerContactValues> = { ...filled }
    delete withoutNotes.notes
    expect(isCustomerContactValues(withoutNotes)).toBe(false)
  })

  it("akzeptiert als IDs nur leere Werte oder UUIDs", () => {
    for (const id of ["tenant-1", " ", `${TENANT_ID} `, "1; DROP"]) {
      expect(isCustomerContactValues({ ...filled, tenantId: id })).toBe(false)
      expect(isCustomerContactValues({ ...filled, locationId: id })).toBe(false)
    }
    expect(isCustomerContactValues({ ...filled, locationId: "" })).toBe(true)
  })

  it("lehnt unbekannte Positionen und Kontaktarten ab", () => {
    expect(isCustomerContactValues({ ...filled, position: "ceo" })).toBe(false)
    expect(isCustomerContactValues({ ...filled, preferredContact: "fax" })).toBe(
      false
    )
  })
})
