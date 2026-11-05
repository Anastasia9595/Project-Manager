import { describe, expect, it, vi } from "vitest"

import {
  handleCreateProject,
  handleProjectOptions,
} from "@/services/projects/new-project.handlers"
import {
  EMPTY_NEW_PROJECT_VALUES,
  type NewProjectValues,
} from "@/services/projects/new-project.values"

const UUID_A = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"
const UUID_B = "4f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6c"
const UUID_C = "5f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6d"

const values: NewProjectValues = {
  ...EMPTY_NEW_PROJECT_VALUES,
  name: "Fruehjahrskampagne",
  tenantId: UUID_A,
  mediaTypeId: UUID_B,
  variantId: UUID_C,
  printingCompanyId: "1",
  circulation: "1000",
  palDate: "2026-12-01",
}

const session = (role: string | null) => ({
  tokens: { accessToken: "token" },
  user: { id: "user-1", role },
})
const agency = session("Agentur Mitarbeiter")

const post = (body: unknown) =>
  new Request("http://x", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  })

const lookup = {
  tenantName: "ACME",
  mediaTypeCategory: null,
  variantMediaType: UUID_B,
  contactTenant: null,
}

function directusError(status: number) {
  return Object.assign(new Error("Secret X"), {
    errors: [{ message: "Secret X", extensions: { code: "SOME_CODE" } }],
    response: { status },
  })
}

function deps(overrides = {}) {
  return {
    fetchLookup: vi.fn().mockResolvedValue(lookup),
    create: vi.fn().mockResolvedValue({ id: "p1", name: "Fruehjahrskampagne" }),
    today: () => "2026-11-05",
    ...overrides,
  }
}

describe("handleCreateProject", () => {
  it("lehnt die Kunden-Rolle mit 403 ab", async () => {
    const d = deps()
    const response = await handleCreateProject(
      post(values),
      session("Kunden"),
      d
    )
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: "forbidden" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("lehnt kaputte Bodys mit 400 invalid_body ab", async () => {
    const d = deps()
    const response = await handleCreateProject(post("{nope"), agency, d)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_body" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("meldet Feldfehler mit 400 invalid_fields", async () => {
    const d = deps()
    const response = await handleCreateProject(
      post({ ...values, name: "" }),
      agency,
      d
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("invalid_fields")
    expect(body.fields.name).toBe("required")
    expect(d.create).not.toHaveBeenCalled()
  })

  it("lehnt eine Variante eines anderen Medientyps ab", async () => {
    const d = deps({
      fetchLookup: vi
        .fn()
        .mockResolvedValue({ ...lookup, variantMediaType: UUID_A }),
    })
    const response = await handleCreateProject(post(values), agency, d)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_variant" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("lehnt eine Kontaktperson eines anderen Kunden ab", async () => {
    const d = deps({
      fetchLookup: vi
        .fn()
        .mockResolvedValue({ ...lookup, contactTenant: UUID_C }),
    })
    const response = await handleCreateProject(
      post({ ...values, tenantUserId: "7" }),
      agency,
      d
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_contact" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("legt das Projekt an und antwortet mit 201", async () => {
    const d = deps()
    const response = await handleCreateProject(post(values), agency, d)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: "p1",
      name: "Fruehjahrskampagne",
    })
    expect(d.create).toHaveBeenCalledWith(
      "token",
      values,
      "user-1",
      lookup,
      "2026-11-05"
    )
  })

  it("antwortet mit 403 vor dem Parsen eines kaputten Bodys", async () => {
    const response = await handleCreateProject(
      post("{nope"),
      session("Kunden"),
      deps()
    )
    expect(response.status).toBe(403)
  })

  it.each([403, 404])(
    "mappt Directus-%i im Lookup auf invalid_reference",
    async (status) => {
      const d = deps({
        fetchLookup: vi.fn().mockRejectedValue(directusError(status)),
      })
      const spy = vi.spyOn(console, "error").mockImplementation(() => {})
      const response = await handleCreateProject(post(values), agency, d)
      spy.mockRestore()
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_reference" })
      expect(d.create).not.toHaveBeenCalled()
    }
  )

  it("reicht Directus-500 im Lookup als 502 durch", async () => {
    const d = deps({
      fetchLookup: vi.fn().mockRejectedValue(directusError(500)),
    })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const response = await handleCreateProject(post(values), agency, d)
    spy.mockRestore()
    expect(response.status).toBe(502)
  })

  it.each([
    [422, 400, "create_failed"],
    [500, 502, "unavailable"],
  ])(
    "mappt Directus-%i in create auf %i ohne Geheimtext im Log",
    async (status, expected, code) => {
      const d = deps({
        create: vi.fn().mockRejectedValue(directusError(status)),
      })
      const spy = vi.spyOn(console, "error").mockImplementation(() => {})
      const response = await handleCreateProject(post(values), agency, d)
      const logged = JSON.stringify(spy.mock.calls)
      spy.mockRestore()
      expect(response.status).toBe(expected)
      expect(await response.json()).toEqual({ error: code })
      expect(logged).not.toContain("Secret X")
    }
  )

  it("antwortet bei Fehlern in create mit 502 ohne Inhalte", async () => {
    const d = deps({ create: vi.fn().mockRejectedValue(new Error("Secret X")) })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const response = await handleCreateProject(post(values), agency, d)
    spy.mockRestore()
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain("Secret X")
  })
})

describe("handleProjectOptions", () => {
  it("lehnt die Kunden-Rolle mit 403 ab", async () => {
    const fetchOptions = vi.fn()
    const response = await handleProjectOptions(session("Kunden"), fetchOptions)
    expect(response.status).toBe(403)
    expect(fetchOptions).not.toHaveBeenCalled()
  })

  it("liefert Agentur-Rollen die Optionen", async () => {
    const options = { tenants: [] }
    const response = await handleProjectOptions(
      agency,
      vi.fn().mockResolvedValue(options)
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(options)
  })
})
