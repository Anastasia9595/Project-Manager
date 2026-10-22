import { describe, expect, it } from "vitest"

import de from "@/i18n/de"
import {
  getFieldMessage,
  getSubmitErrorMessage,
} from "@/lib/customer-contact-form/messages"

const t = de.customerContactsPage.form

describe("getFieldMessage", () => {
  it("liefert keine Meldung ohne Fehler", () => {
    expect(getFieldMessage(undefined, "firstName", t.validation)).toBeUndefined()
  })

  it("nennt bei Pflichtfeldern das fehlende Feld", () => {
    expect(getFieldMessage("required", "firstName", t.validation)).toBe(
      t.validation.required.firstName
    )
    expect(getFieldMessage("required", "tenantId", t.validation)).toBe(
      t.validation.required.tenantId
    )
  })

  it("liefert keine Meldung für ein Feld, das kein Pflichtfeld ist", () => {
    expect(getFieldMessage("required", "notes", t.validation)).toBeUndefined()
  })

  it("ordnet die übrigen Fehlercodes ihren Texten zu", () => {
    expect(getFieldMessage("invalidEmail", "email", t.validation)).toBe(
      t.validation.invalidEmail
    )
    expect(getFieldMessage("invalidPhone", "phone", t.validation)).toBe(
      t.validation.invalidPhone
    )
    expect(getFieldMessage("tooLong", "notes", t.validation)).toBe(
      t.validation.tooLong
    )
  })
})

describe("getSubmitErrorMessage", () => {
  it.each([
    ["unauthorized", t.sessionExpired],
    ["forbidden", t.forbidden],
    ["invalid_location", t.invalidLocation],
  ])("zeigt für %s den passenden Text", (code, text) => {
    expect(getSubmitErrorMessage(code, t)).toBe(text)
  })

  it.each(["network_error", "server_error", "create_failed", "unavailable"])(
    "zeigt für %s die allgemeine Fehlermeldung",
    (code) => {
      expect(getSubmitErrorMessage(code, t)).toBe(t.saveError)
    }
  )
})
