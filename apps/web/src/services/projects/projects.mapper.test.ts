import { describe, expect, it } from "vitest"

import { toProject, toProjects } from "@/services/projects/projects.mapper"
import type { PrintingLineRow } from "@/services/projects/projects.types"

const row: PrintingLineRow = {
  id: "p1",
  name: "Weber_4526_Flyer_Jubilaeum",
  status: "in progress",
  pal_date: "2026-11-20",
  buffer_days: 2,
  circulation: 30000,
  tenant: { tenant_name: "Weber Medien GmbH" },
  tasks: [{ completed: true }, { completed: false }, { completed: null }],
}

describe("toProject", () => {
  it("bildet eine Druckstrecke auf ein Projekt ab", () => {
    expect(toProject(row)).toEqual({
      id: "p1",
      name: "Weber_4526_Flyer_Jubilaeum",
      status: "active",
      palDate: new Date(2026, 10, 20),
      dataHandoverDate: new Date(2026, 10, 18),
      customer: "Weber Medien GmbH",
      progress: { done: 1, total: 3 },
      circulation: 30000,
    })
  })

  it.each([
    ["created", "created"],
    ["in progress", "active"],
    ["completed", "completed"],
    ["invoiced", "completed"],
  ] as const)("übersetzt den Status %s in %s", (status, expected) => {
    expect(toProject({ ...row, status })?.status).toBe(expected)
  })

  it("blendet stornierte Druckstrecken aus", () => {
    expect(toProject({ ...row, status: "cancelled" })).toBeNull()
    expect(
      toProjects([row, { ...row, id: "p2", status: "cancelled" }]).map(
        (p) => p.id
      )
    ).toEqual(["p1"])
  })

  it("setzt fehlende Werte auf neutrale Standardwerte", () => {
    expect(
      toProject({
        ...row,
        name: null,
        buffer_days: null,
        circulation: null,
        tenant: null,
        tasks: null,
      })
    ).toMatchObject({
      name: "",
      dataHandoverDate: new Date(2026, 10, 20),
      customer: "",
      progress: { done: 0, total: 0 },
      circulation: 0,
    })
  })
})
