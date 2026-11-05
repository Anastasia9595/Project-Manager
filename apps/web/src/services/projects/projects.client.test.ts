import { afterEach, describe, expect, it, vi } from "vitest"

import { submitNewProject } from "./projects.client"
import { EMPTY_NEW_PROJECT_VALUES } from "./new-project.values"

const values = { ...EMPTY_NEW_PROJECT_VALUES, name: "Herbstprospekt" }

function stubFetch(response: Response | Error) {
  const fetchMock = vi.fn(() =>
    response instanceof Error
      ? Promise.reject(response)
      : Promise.resolve(response)
  )
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

describe("submitNewProject", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sendet die Werte als JSON mit Zeitlimit und gibt Id und Name zurück", async () => {
    const fetchMock = stubFetch(
      Response.json({ id: "42", name: "Herbstprospekt" }, { status: 201 })
    )
    expect(await submitNewProject(values)).toEqual({
      ok: true,
      id: "42",
      name: "Herbstprospekt",
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(url).toBe("/api/projects")
    expect(init.method).toBe("POST")
    expect(JSON.parse(init.body as string)).toEqual(values)
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })

  it("gibt Feldfehler des Servers zurück", async () => {
    stubFetch(
      Response.json(
        { error: "invalid_fields", fields: { palDate: "pastDate" } },
        { status: 400 }
      )
    )
    expect(await submitNewProject(values)).toEqual({
      ok: false,
      error: "invalid_fields",
      fields: { palDate: "pastDate" },
    })
  })

  it("gibt den Fehlercode der API zurück", async () => {
    stubFetch(Response.json({ error: "forbidden" }, { status: 403 }))
    expect(await submitNewProject(values)).toEqual({
      ok: false,
      error: "forbidden",
      fields: undefined,
    })
  })

  it("meldet server_error, wenn die Antwort kein JSON ist", async () => {
    stubFetch(new Response("<html>Fehler</html>", { status: 502 }))
    expect(await submitNewProject(values)).toMatchObject({
      ok: false,
      error: "server_error",
    })
  })

  it("meldet network_error bei Netzwerkfehler oder Zeitüberschreitung", async () => {
    stubFetch(new TypeError("fetch failed"))
    expect(await submitNewProject(values)).toEqual({
      ok: false,
      error: "network_error",
    })
  })
})
