import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ProjectLookup } from "./new-project.types"
import {
  EMPTY_NEW_PROJECT_VALUES,
  type NewProjectValues,
} from "./new-project.values"

// SDK-Befehle sind Funktionen, die { path, method } liefern; daran erkennt der Fake die Aufrufe.
type Command = () => { path: string; method: string }
type Handler = (call: { path: string; method: string }) => unknown

let handler: Handler
const calls: { path: string; method: string }[] = []
const request = vi.fn(async (command: Command) => {
  const call = command()
  calls.push(call)
  return handler(call)
})
vi.mock("@/services/directus/client", () => ({
  createUserClient: async () => ({ request }),
}))

const { createProject } = await import("./new-project.repository")

const values: NewProjectValues = {
  ...EMPTY_NEW_PROJECT_VALUES,
  name: "Geheimes Projekt",
  tenantId: "t-uuid",
  mediaTypeId: "m-uuid",
  variantId: "v-uuid",
  printingCompanyId: "3",
  circulation: "1000",
  palDate: "2026-12-01",
  internalNotes: "Vertrauliche Notiz",
}
const lookup: ProjectLookup = {
  tenantName: "Weber",
  mediaTypeCategory: "print",
  variantMediaType: "m-uuid",
  contactTenant: null,
}

const create = () => createProject("token", values, "u1", lookup, "2026-11-05")

/** Antwortet wie Directus; `lineError`/`deleteError` lassen die jeweiligen Aufrufe scheitern. */
function directus({
  lineError,
  deleteError,
}: { lineError?: Error; deleteError?: Error } = {}): Handler {
  return ({ path, method }) => {
    if (method === "GET") return []
    if (method === "POST" && path === "/items/form_submissions") {
      return { id: "sub-1" }
    }
    if (method === "POST" && path === "/items/printing_lines") {
      if (lineError) throw lineError
      return { id: "line-1", name: "Geheimes Projekt" }
    }
    if (method === "DELETE") {
      if (deleteError) throw deleteError
      return undefined
    }
    throw new Error(`unexpected ${method} ${path}`)
  }
}

const deletes = () => calls.filter((call) => call.method === "DELETE")

describe("createProject", () => {
  beforeEach(() => {
    calls.length = 0
    request.mockClear()
    vi.restoreAllMocks()
  })

  it("löscht die Einreichung, wenn die Druckstrecke scheitert, und wirft den Originalfehler", async () => {
    const lineError = new Error("line failed")
    handler = directus({ lineError })
    await expect(create()).rejects.toBe(lineError)
    expect(deletes()).toEqual([
      { path: "/items/form_submissions/sub-1", method: "DELETE" },
    ])
  })

  it("wirft den Originalfehler auch, wenn das Aufräumen scheitert, und loggt keine Formularwerte", async () => {
    const lineError = new Error("line failed")
    handler = directus({ lineError, deleteError: new Error("delete failed") })
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
    await expect(create()).rejects.toBe(lineError)
    expect(deletes()).toHaveLength(1)
    expect(consoleError).toHaveBeenCalledTimes(1)
    expect(consoleError).toHaveBeenCalledWith("project cleanup failed")
  })

  it("legt beides an, ohne zu löschen", async () => {
    handler = directus()
    await expect(create()).resolves.toEqual({
      id: "line-1",
      name: "Geheimes Projekt",
    })
    expect(deletes()).toEqual([])
  })
})
