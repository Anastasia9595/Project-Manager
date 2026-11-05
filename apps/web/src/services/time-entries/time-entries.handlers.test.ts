import { describe, expect, it, vi } from "vitest"

import {
  handleBookedTasks,
  handleCreateEntry,
  handleDeleteEntry,
  handleListEntries,
  handleUpdateEntry,
} from "@/services/time-entries/time-entries.handlers"
import { createDirectusError } from "@/services/time-entries/test-support"

const json = (body: unknown, method = "POST") =>
  new Request("http://x/api/time-entries", {
    method,
    body: JSON.stringify(body),
  })
const booking = {
  id: "e1",
  project: "p1",
  task: "t1",
  date: "2026-11-04",
  duration_minutes: 30,
  description: null,
  user: "u1",
}
const valid = {
  task: "t1",
  date: "2026-11-04",
  duration_minutes: 30,
  description: null,
}

describe("handleCreateEntry", () => {
  it("legt an und antwortet mit 201", async () => {
    const create = vi.fn().mockResolvedValue(booking)
    const response = await handleCreateEntry(json(valid), "token", create)
    expect(create).toHaveBeenCalledWith("token", valid)
    expect(response.status).toBe(201)
    expect(await response.json()).toEqual(booking)
  })

  it("lehnt ungültige Bodys mit 400 ab", async () => {
    const create = vi.fn()
    const response = await handleCreateEntry(
      json({ ...valid, duration_minutes: 0 }),
      "token",
      create
    )
    expect(response.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })
})

describe("handleUpdateEntry", () => {
  it("ändert und antwortet mit 200", async () => {
    const update = vi.fn().mockResolvedValue(booking)
    const response = await handleUpdateEntry(
      json({ description: "x" }, "PATCH"),
      "e1",
      "token",
      update
    )
    expect(update).toHaveBeenCalledWith("token", "e1", { description: "x" })
    expect(response.status).toBe(200)
  })

  it("lehnt leere Änderungen mit 400 ab", async () => {
    const response = await handleUpdateEntry(
      json({}, "PATCH"),
      "e1",
      "token",
      vi.fn()
    )
    expect(response.status).toBe(400)
  })
})

describe("handleDeleteEntry", () => {
  it("löscht und antwortet mit 204", async () => {
    const remove = vi.fn().mockResolvedValue(undefined)
    const response = await handleDeleteEntry("e1", "token", remove)
    expect(remove).toHaveBeenCalledWith("token", "e1")
    expect(response.status).toBe(204)
  })

  it("reicht Directus-Verbote als 403 durch", async () => {
    const response = await handleDeleteEntry(
      "e1",
      "token",
      vi.fn().mockRejectedValue(createDirectusError(403))
    )
    expect(response.status).toBe(403)
  })
})

describe("Lese-Handler", () => {
  it("liefert die Buchungen der Woche", async () => {
    const list = vi.fn().mockResolvedValue([booking])
    const response = await handleListEntries(
      new URL("http://x/api/time-entries?week=2026-11-02"),
      "token",
      list
    )
    expect(list).toHaveBeenCalledWith("token", "2026-11-02")
    expect(await response.json()).toEqual({ entries: [booking] })
  })

  it("verlangt einen gültigen Wochenparameter", async () => {
    const response = await handleListEntries(
      new URL("http://x/api/time-entries?week=heute"),
      "token",
      vi.fn()
    )
    expect(response.status).toBe(400)
  })

  it("liefert die gebuchten Aufgaben", async () => {
    const response = await handleBookedTasks(
      "token",
      vi.fn().mockResolvedValue(["t1"])
    )
    expect(await response.json()).toEqual({ taskIds: ["t1"] })
  })
})
