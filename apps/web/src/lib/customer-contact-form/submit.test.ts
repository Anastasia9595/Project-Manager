import { afterEach, describe, expect, it, vi } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"
import {
  SUBMIT_TIMEOUT_MS,
  submitCustomerContact,
} from "@/lib/customer-contact-form/submit"

const values = { ...EMPTY_CUSTOMER_CONTACT_VALUES, firstName: "Anna" }

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response)
  )
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("submitCustomerContact", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sendet die Werte als JSON mit Zeitlimit und meldet Erfolg", async () => {
    const fetchMock = stubFetch(Response.json({ ok: true }))
    expect(await submitCustomerContact(values)).toEqual({ ok: true })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe("/api/customer-contacts")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual(values)
    expect(init.signal).toBeInstanceOf(AbortSignal)
    expect(SUBMIT_TIMEOUT_MS).toBeGreaterThan(0)
  })

  it("gibt den Fehlercode der API zurück", async () => {
    stubFetch(Response.json({ error: "unauthorized" }, { status: 401 }))
    expect(await submitCustomerContact(values)).toEqual({
      ok: false,
      error: "unauthorized",
      fields: undefined,
    })
  })

  it("gibt Feldfehler des Servers zurück", async () => {
    stubFetch(
      Response.json(
        { error: "invalid_fields", fields: { phone: "invalidPhone" } },
        { status: 400 }
      )
    )
    expect(await submitCustomerContact(values)).toEqual({
      ok: false,
      error: "invalid_fields",
      fields: { phone: "invalidPhone" },
    })
  })

  it("meldet server_error, wenn die Antwort kein JSON ist", async () => {
    stubFetch(new Response("<html>Fehler</html>", { status: 500 }))
    expect(await submitCustomerContact(values)).toMatchObject({
      ok: false,
      error: "server_error",
    })
  })

  it("meldet network_error bei Netzwerkfehler oder Zeitüberschreitung", async () => {
    stubFetch(new TypeError("fetch failed"))
    expect(await submitCustomerContact(values)).toEqual({
      ok: false,
      error: "network_error",
    })
  })
})
