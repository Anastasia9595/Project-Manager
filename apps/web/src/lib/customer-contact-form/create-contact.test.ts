import { beforeEach, describe, expect, it, vi } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"

const createTenantUser = vi.fn()
vi.mock("@/lib/customer-contact-form/repository", () => ({ createTenantUser }))

const { handleCreateContact } = await import(
  "@/lib/customer-contact-form/create-contact"
)

const valid = {
  ...EMPTY_CUSTOMER_CONTACT_VALUES,
  firstName: "Anna",
  lastName: "Muster",
  tenantId: "tenant-1",
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/customer-contacts", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

describe("handleCreateContact", () => {
  beforeEach(() => {
    createTenantUser.mockReset()
  })

  it("legt den Kontakt an und antwortet mit 200", async () => {
    createTenantUser.mockResolvedValue(undefined)
    const response = await handleCreateContact(post(valid))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(createTenantUser).toHaveBeenCalledWith(valid)
  })

  it("antwortet mit 400 bei ungültigem JSON oder Body", async () => {
    for (const body of ["kein json", { firstName: "Anna" }]) {
      const response = await handleCreateContact(post(body))
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_body" })
    }
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("antwortet mit 400 und den Feldfehlern", async () => {
    const response = await handleCreateContact(
      post({ ...valid, firstName: "", email: "kein-mail" })
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: "invalid_fields",
      fields: { firstName: "required", email: "invalidEmail" },
    })
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("antwortet mit create_failed, wenn Directus den Eintrag ablehnt", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    createTenantUser.mockRejectedValue(
      Object.assign(new Error("rejected"), {
        errors: [{ message: "x", extensions: { code: "FAILED_VALIDATION" } }],
      })
    )
    const response = await handleCreateContact(post(valid))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "create_failed" })
  })

  it("reicht unerwartete Fehler weiter", async () => {
    createTenantUser.mockRejectedValue(new Error("boom"))
    await expect(handleCreateContact(post(valid))).rejects.toThrow("boom")
  })
})
