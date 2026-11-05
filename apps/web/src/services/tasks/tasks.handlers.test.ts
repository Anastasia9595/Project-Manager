import { describe, expect, it, vi } from "vitest"

import { handleUpdateTask } from "@/services/tasks/tasks.handlers"

const ID = "3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b"

const request = (body: unknown) =>
  new Request("http://x/api/tasks/t1", {
    method: "PATCH",
    body: JSON.stringify(body),
  })

describe("handleUpdateTask", () => {
  it("speichert den Erledigt-Status und antwortet mit completedAt", async () => {
    const update = vi.fn().mockResolvedValue({
      id: ID,
      completed: true,
      completedAt: "2026-11-05T10:00:00.000Z",
    })
    const response = await handleUpdateTask(
      request({ completed: true }),
      ID,
      "token",
      update
    )
    expect(update).toHaveBeenCalledWith("token", ID, true)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      id: ID,
      completed: true,
      completedAt: "2026-11-05T10:00:00.000Z",
    })
  })

  it("lehnt ungültige Bodys mit 400 ab, ohne Directus aufzurufen", async () => {
    const update = vi.fn()
    for (const body of [null, {}, { completed: "ja" }, []]) {
      const response = await handleUpdateTask(
        request(body),
        ID,
        "token",
        update
      )
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_body" })
    }
    expect(update).not.toHaveBeenCalled()
  })

  it("antwortet bei Netzwerkfehlern mit 502", async () => {
    const update = vi.fn().mockRejectedValue(new Error("down"))
    const response = await handleUpdateTask(
      request({ completed: false }),
      ID,
      "token",
      update
    )
    expect(response.status).toBe(502)
  })

  it("lehnt ungültige ids mit 400 ab, ohne Directus aufzurufen", async () => {
    const update = vi.fn()
    const response = await handleUpdateTask(
      request({ completed: true }),
      "t1",
      "token",
      update
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "invalid_id" })
    expect(update).not.toHaveBeenCalled()
  })
})
