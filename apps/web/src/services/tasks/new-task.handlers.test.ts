import { describe, expect, it, vi } from "vitest"

import {
  handleCreateTask,
  handleTaskOptions,
} from "@/services/tasks/new-task.handlers"
import {
  EMPTY_NEW_TASK_VALUES,
  type NewTaskValues,
} from "@/services/tasks/new-task.values"

const UUID_A = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"

const values: NewTaskValues = {
  ...EMPTY_NEW_TASK_VALUES,
  name: "Druckdaten pruefen",
  projectId: UUID_A,
  dueDate: "2026-12-01",
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

function directusError(status: number) {
  return Object.assign(new Error("Secret X"), {
    errors: [{ message: "Secret X", extensions: { code: "SOME_CODE" } }],
    response: { status },
  })
}

function deps(overrides = {}) {
  return {
    fetchProject: vi.fn().mockResolvedValue({ status: "in progress" }),
    create: vi.fn().mockResolvedValue({ id: "t1", name: "Druckdaten pruefen" }),
    ...overrides,
  }
}

describe("handleCreateTask", () => {
  it("lehnt die Kunden-Rolle mit 403 ab", async () => {
    const d = deps()
    const response = await handleCreateTask(post(values), session("Kunden"), d)
    expect(response.status).toBe(403)
    expect(await response.json()).toEqual({ error: "forbidden" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("antwortet mit 403 vor dem Parsen eines kaputten Bodys", async () => {
    const d = deps()
    const response = await handleCreateTask(post("{nope"), session("Kunden"), d)
    expect(response.status).toBe(403)
    expect(d.create).not.toHaveBeenCalled()
  })

  it("lehnt kaputte Bodys mit 400 invalid_body ab", async () => {
    const d = deps()
    const response = await handleCreateTask(post("{nope"), agency, d)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_body" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("meldet einen leeren Titel mit 400 invalid_fields", async () => {
    const d = deps()
    const response = await handleCreateTask(
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

  it("meldet ein fehlendes Projekt mit invalid_fields", async () => {
    const d = deps()
    const response = await handleCreateTask(
      post({ ...values, projectId: "" }),
      agency,
      d
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe("invalid_fields")
    expect(body.fields.projectId).toBe("required")
    expect(d.create).not.toHaveBeenCalled()
  })

  it.each([403, 404])(
    "mappt Directus-%i im Projekt-Lookup auf invalid_project",
    async (status) => {
      const d = deps({
        fetchProject: vi.fn().mockRejectedValue(directusError(status)),
      })
      const spy = vi.spyOn(console, "error").mockImplementation(() => {})
      const response = await handleCreateTask(post(values), agency, d)
      spy.mockRestore()
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_project" })
      expect(d.create).not.toHaveBeenCalled()
    }
  )

  it("reicht Directus-500 im Projekt-Lookup als 502 durch", async () => {
    const d = deps({
      fetchProject: vi.fn().mockRejectedValue(directusError(500)),
    })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const response = await handleCreateTask(post(values), agency, d)
    spy.mockRestore()
    expect(response.status).toBe(502)
    expect(d.create).not.toHaveBeenCalled()
  })

  it("lehnt ein abgeschlossenes Projekt mit invalid_project ab", async () => {
    const d = deps({
      fetchProject: vi.fn().mockResolvedValue({ status: "completed" }),
    })
    const response = await handleCreateTask(post(values), agency, d)
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_project" })
    expect(d.create).not.toHaveBeenCalled()
  })

  it("akzeptiert ein Projekt im Status created", async () => {
    const d = deps({
      fetchProject: vi.fn().mockResolvedValue({ status: "created" }),
    })
    const response = await handleCreateTask(post(values), agency, d)
    expect(response.status).toBe(201)
  })

  it("legt die Aufgabe an und antwortet mit 201", async () => {
    const d = deps()
    const response = await handleCreateTask(post(values), agency, d)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({
      id: "t1",
      name: "Druckdaten pruefen",
    })
    expect(d.create).toHaveBeenCalledWith("token", values, "user-1")
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
      const response = await handleCreateTask(post(values), agency, d)
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
    const response = await handleCreateTask(post(values), agency, d)
    spy.mockRestore()
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain("Secret X")
  })
})

describe("handleTaskOptions", () => {
  it("lehnt die Kunden-Rolle mit 403 ab", async () => {
    const fetchOptions = vi.fn()
    const response = await handleTaskOptions(session("Kunden"), fetchOptions)
    expect(response.status).toBe(403)
    expect(fetchOptions).not.toHaveBeenCalled()
  })

  it("liefert Agentur-Rollen die Optionen", async () => {
    const options = { projects: [], templates: [] }
    const response = await handleTaskOptions(
      agency,
      vi.fn().mockResolvedValue(options)
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(options)
  })
})
