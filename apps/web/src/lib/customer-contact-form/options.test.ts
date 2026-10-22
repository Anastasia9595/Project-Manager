import { describe, expect, it } from "vitest"

import de from "@/i18n/de"
import {
  getLocationPlaceholder,
  toLocationOptions,
  toPositionOptions,
  toTenantOptions,
} from "@/lib/customer-contact-form/options"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"

const options: ContactOptions = {
  tenants: [
    { id: "t1", name: "Musterkunde 001" },
    { id: "t2", name: "Musterkunde 002" },
  ],
  locations: [
    { id: "l1", name: "Standort 001", tenant: "t1" },
    { id: "l2", name: "Standort 002", tenant: "t2" },
    { id: "l3", name: "Standort 003", tenant: null },
  ],
}

const texts = de.customerContactsPage.form

describe("toTenantOptions", () => {
  it("macht aus Kunden Auswahleinträge", () => {
    expect(toTenantOptions(options)).toEqual([
      { value: "t1", label: "Musterkunde 001" },
      { value: "t2", label: "Musterkunde 002" },
    ])
  })
})

describe("toLocationOptions", () => {
  it("liefert nur Standorte des gewählten Kunden", () => {
    expect(toLocationOptions(options, "t1")).toEqual([
      { value: "l1", label: "Standort 001" },
    ])
  })

  it("liefert nichts ohne Kunde und ignoriert Standorte ohne Kunde", () => {
    expect(toLocationOptions(options, "")).toEqual([])
    expect(toLocationOptions(options, "unbekannt")).toEqual([])
  })
})

describe("toPositionOptions", () => {
  it("übersetzt alle Positionen in Anzeigetexte", () => {
    const result = toPositionOptions(texts.positions)
    expect(result).toHaveLength(5)
    expect(result[0]).toEqual({
      value: "management",
      label: texts.positions.management,
    })
  })
})

describe("getLocationPlaceholder", () => {
  it("sagt, was noch fehlt", () => {
    expect(getLocationPlaceholder("", 0, texts.placeholders)).toBe(
      texts.placeholders.locationNeedsTenant
    )
    expect(getLocationPlaceholder("t1", 0, texts.placeholders)).toBe(
      texts.placeholders.locationNone
    )
    expect(getLocationPlaceholder("t1", 2, texts.placeholders)).toBe(
      texts.placeholders.location
    )
  })
})
