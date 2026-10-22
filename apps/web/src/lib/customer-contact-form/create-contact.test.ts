import { beforeEach, describe, expect, it, vi } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"

const createTenantUser = vi.fn()
const fetchLocationTenant = vi.fn()
vi.mock("@/lib/customer-contact-form/repository", () => ({
  createTenantUser,
  fetchLocationTenant,
}))

const { handleCreateContact } = await import(
  "@/lib/customer-contact-form/create-contact"
)

const TENANT_ID = "11111111-1111-4111-8111-111111111111"
const OTHER_TENANT_ID = "33333333-3333-4333-8333-333333333333"
const LOCATION_ID = "22222222-2222-4222-8222-222222222222"
const TOKEN = "user-access-token"

const valid = {
  ...EMPTY_CUSTOMER_CONTACT_VALUES,
  firstName: "Anna",
  lastName: "Muster",
  tenantId: TENANT_ID,
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/customer-contacts", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

function directusError(status: number) {
  return Object.assign(new Error("directus"), {
    errors: [{ message: "x", extensions: { code: "SOME_CODE" } }],
    response: { status },
  })
}

describe("handleCreateContact", () => {
  beforeEach(() => {
    createTenantUser.mockReset()
    fetchLocationTenant.mockReset()
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("legt den Kontakt mit dem Token der Person an und antwortet mit 200", async () => {
    createTenantUser.mockResolvedValue(undefined)
    const response = await handleCreateContact(post(valid), TOKEN)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(createTenantUser).toHaveBeenCalledWith(TOKEN, valid)
    expect(fetchLocationTenant).not.toHaveBeenCalled()
  })

  it("antwortet mit 400 bei ungültigem JSON oder Body", async () => {
    for (const body of [
      "kein json",
      { firstName: "Anna" },
      { ...valid, tenantId: "tenant-1" },
      { ...valid, tenantId: " " },
      { ...valid, locationId: "location-1" },
    ]) {
      const response = await handleCreateContact(post(body), TOKEN)
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_body" })
    }
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("antwortet mit 400 und den Feldfehlern", async () => {
    const response = await handleCreateContact(
      post({
        ...valid,
        firstName: "",
        email: "kein-mail",
        phone: "abc",
        notes: "a".repeat(2001),
      }),
      TOKEN
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: "invalid_fields",
      fields: {
        firstName: "required",
        email: "invalidEmail",
        phone: "invalidPhone",
        notes: "tooLong",
      },
    })
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("lehnt einen Standort eines anderen Kunden ab", async () => {
    fetchLocationTenant.mockResolvedValue(OTHER_TENANT_ID)
    const response = await handleCreateContact(
      post({ ...valid, locationId: LOCATION_ID }),
      TOKEN
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_location" })
    expect(fetchLocationTenant).toHaveBeenCalledWith(TOKEN, LOCATION_ID)
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("lehnt einen Standort ohne Kunden ab", async () => {
    fetchLocationTenant.mockResolvedValue(null)
    const response = await handleCreateContact(
      post({ ...valid, locationId: LOCATION_ID }),
      TOKEN
    )
    expect(response.status).toBe(400)
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("legt den Kontakt an, wenn der Standort zum Kunden gehört", async () => {
    fetchLocationTenant.mockResolvedValue(TENANT_ID)
    createTenantUser.mockResolvedValue(undefined)
    const input = { ...valid, locationId: LOCATION_ID }
    const response = await handleCreateContact(post(input), TOKEN)
    expect(response.status).toBe(200)
    expect(createTenantUser).toHaveBeenCalledWith(TOKEN, input)
  })

  it.each([
    [401, 401, "unauthorized"],
    [403, 403, "forbidden"],
    [400, 400, "create_failed"],
    [503, 502, "unavailable"],
  ])(
    "bildet den Directus-Status %i auf %i %s ab",
    async (directusStatus, status, code) => {
      createTenantUser.mockRejectedValue(directusError(directusStatus))
      const response = await handleCreateContact(post(valid), TOKEN)
      expect(response.status).toBe(status)
      expect(await response.json()).toEqual({ error: code })
    }
  )

  it("antwortet bei Netzwerkfehlern mit 502 und JSON", async () => {
    createTenantUser.mockRejectedValue(new TypeError("fetch failed"))
    const response = await handleCreateContact(post(valid), TOKEN)
    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: "unavailable" })
  })

  it("loggt keine Eingaben der Person", async () => {
    createTenantUser.mockRejectedValue(
      Object.assign(directusError(400), { message: "Anna Muster anna@x.de" })
    )
    await handleCreateContact(post(valid), TOKEN)
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
      "Anna"
    )
  })
})
