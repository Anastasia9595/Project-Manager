import { describe, expect, it, vi } from "vitest"

import { handleUpdateTask } from "@/services/tasks/tasks.handlers"

const request = (body: unknown) =>
  new Request("http://x/api/tasks/t1", {
    method: "PATCH",
    body: JSON.stringify(body),
  })

describe("handleUpdateTask", () => {
  it("speichert den Erledigt-Status und antwortet mit completedAt", async () => {
    const update = vi
      .fn()
      .mockResolvedValue({
        id: "t1",
        completed: true,
        completedAt: "2026-11-05T10:00:00.000Z",
      })
    const response = await handleUpdateTask(
      request({ completed: true }),
      "t1",
      "token",
      update
    )
    expect(update).toHaveBeenCalledWith("token", "t1", true)
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      id: "t1",
      completed: true,
      completedAt: "2026-11-05T10:00:00.000Z",
    })
  })

  it("lehnt ungültige Bodys mit 400 ab, ohne Directus aufzurufen", async () => {
    const update = vi.fn()
    for (const body of [null, {}, { completed: "ja" }, []]) {
      const response = await handleUpdateTask(
        request(body),
        "t1",
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
      "t1",
      "token",
      update
    )
    expect(response.status).toBe(502)
  })
})
