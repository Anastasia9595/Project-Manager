import { describe, expect, it } from "vitest"

import {
  computeDueDate,
  toTaskOptions,
  toTaskPayload,
} from "@/services/tasks/new-task.mapper"
import {
  EMPTY_NEW_TASK_VALUES,
  type NewTaskValues,
} from "@/services/tasks/new-task.values"

const project = {
  palDate: "2026-12-02",
  deliveryDate: "2026-12-30",
  distributionDate: null,
}

describe("computeDueDate", () => {
  it("date_created: heute + Offset", () => {
    expect(
      computeDueDate(
        { anchor: "date_created", offset: 2 },
        undefined,
        "2026-11-05"
      )
    ).toBe("2026-11-07")
  })
  it("pal_date mit negativem Offset ueber die Monatsgrenze", () => {
    expect(
      computeDueDate({ anchor: "pal_date", offset: -3 }, project, "2026-11-05")
    ).toBe("2026-11-29")
  })
  it("Jahreswechsel", () => {
    expect(
      computeDueDate(
        { anchor: "delivery_date", offset: 5 },
        project,
        "2026-11-05"
      )
    ).toBe("2027-01-04")
  })
  it("fehlendes Projektdatum -> leer", () => {
    expect(
      computeDueDate(
        { anchor: "distribution_date", offset: 1 },
        project,
        "2026-11-05"
      )
    ).toBe("")
  })
  it("kein Projekt bei pal_date -> leer", () => {
    expect(
      computeDueDate({ anchor: "pal_date", offset: 1 }, undefined, "2026-11-05")
    ).toBe("")
  })
})

describe("toTaskPayload", () => {
  it("trimmt und setzt feste Felder", () => {
    const values: NewTaskValues = {
      ...EMPTY_NEW_TASK_VALUES,
      name: "  Korrektur  ",
      projectId: "p1",
      dueDate: "2026-11-30",
      priority: "high",
      description: "   ",
    }
    expect(toTaskPayload(values, "u1")).toEqual({
      task_name: "Korrektur",
      description: null,
      priority: "high",
      due_date: "2026-11-30",
      printing_lines: "p1",
      assigned_to: "u1",
      status: "published",
      completed: false,
    })
  })
})

describe("toTaskOptions", () => {
  it("bildet Projekte und Vorlagen ab", () => {
    expect(
      toTaskOptions({
        projects: [
          {
            id: "p1",
            name: null,
            pal_date: "2026-12-02",
            delivery_date: null,
            distribution_date: null,
            tenant: { tenant_name: "Weber" },
          },
          {
            id: "p2",
            name: "Flyer",
            pal_date: null,
            delivery_date: null,
            distribution_date: null,
            tenant: null,
          },
        ],
        templates: [
          {
            id: "t1",
            task_name: "Druckdaten",
            description: null,
            due_date_anchor: "pal_date",
            due_date_offset: -3,
          },
        ],
      })
    ).toEqual({
      projects: [
        {
          id: "p1",
          name: "",
          customer: "Weber",
          palDate: "2026-12-02",
          deliveryDate: null,
          distributionDate: null,
        },
        {
          id: "p2",
          name: "Flyer",
          customer: "",
          palDate: null,
          deliveryDate: null,
          distributionDate: null,
        },
      ],
      templates: [
        {
          id: "t1",
          name: "Druckdaten",
          description: "",
          anchor: "pal_date",
          offset: -3,
        },
      ],
    })
  })
})
