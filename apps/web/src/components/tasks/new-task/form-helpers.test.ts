import { describe, expect, it } from "vitest"

import { getDictionary } from "@/i18n"
import type { TaskOptions } from "@/services/tasks/new-task.types"
import { EMPTY_NEW_TASK_VALUES } from "@/services/tasks/new-task.values"
import {
  applyProject,
  applyTemplate,
  getFieldMessage,
  getSubmitErrorMessage,
  toProjectOptions,
  toTemplateOptions,
} from "./form-helpers"

const t = getDictionary("de").tasksPage.form
const TODAY = "2026-11-05"

const options: TaskOptions = {
  projects: [
    {
      id: "p1",
      name: "Herbstprospekt",
      customer: "Muster GmbH",
      palDate: "2026-12-01",
      deliveryDate: null,
      distributionDate: null,
    },
    {
      id: "p2",
      name: "Winterflyer",
      customer: "",
      palDate: "2027-01-10",
      deliveryDate: null,
      distributionDate: null,
    },
  ],
  templates: [
    {
      id: "t1",
      name: "Druckdaten prüfen",
      description: "PDF prüfen",
      anchor: "pal_date",
      offset: -3,
    },
    {
      id: "t2",
      name: "Rückruf",
      description: "",
      anchor: "date_created",
      offset: 2,
    },
  ],
}

describe("Auswahllisten", () => {
  it("zeigt Projekte als „Name – Kunde“", () => {
    expect(toProjectOptions(options)).toEqual([
      { value: "p1", label: "Herbstprospekt – Muster GmbH" },
      { value: "p2", label: "Winterflyer" },
    ])
  })

  it("zeigt Vorlagen mit ihrem Titel", () => {
    expect(toTemplateOptions(options)).toEqual([
      { value: "t1", label: "Druckdaten prüfen" },
      { value: "t2", label: "Rückruf" },
    ])
  })
})

describe("applyTemplate", () => {
  it("füllt Titel, Beschreibung und Fälligkeit aus der Vorlage", () => {
    const values = { ...EMPTY_NEW_TASK_VALUES, projectId: "p1" }
    expect(applyTemplate(values, "t1", options, TODAY)).toEqual({
      ...values,
      templateId: "t1",
      name: "Druckdaten prüfen",
      description: "PDF prüfen",
      dueDate: "2026-11-28",
    })
  })

  it("lässt die Fälligkeit leer, solange das Ankerdatum fehlt", () => {
    expect(
      applyTemplate(EMPTY_NEW_TASK_VALUES, "t1", options, TODAY).dueDate
    ).toBe("")
    expect(
      applyTemplate(EMPTY_NEW_TASK_VALUES, "t2", options, TODAY).dueDate
    ).toBe("2026-11-07")
  })

  it("leert ohne Vorlage nur die Vorlage und lässt die Werte stehen", () => {
    const values = {
      ...EMPTY_NEW_TASK_VALUES,
      templateId: "t1",
      name: "Eigener Titel",
      dueDate: "2026-12-24",
    }
    expect(applyTemplate(values, "", options, TODAY)).toEqual({
      ...values,
      templateId: "",
    })
  })
})

describe("applyProject", () => {
  const withTemplate = applyTemplate(
    { ...EMPTY_NEW_TASK_VALUES, projectId: "p1" },
    "t1",
    options,
    TODAY
  )

  it("berechnet die Fälligkeit neu, solange sie nicht von Hand geändert wurde", () => {
    expect(applyProject(withTemplate, "p2", options, false, TODAY)).toEqual({
      ...withTemplate,
      projectId: "p2",
      dueDate: "2027-01-07",
    })
  })

  it("behält eine von Hand geänderte Fälligkeit", () => {
    const touched = { ...withTemplate, dueDate: "2026-12-24" }
    expect(applyProject(touched, "p2", options, true, TODAY)).toEqual({
      ...touched,
      projectId: "p2",
    })
  })

  it("ändert ohne Vorlage nur das Projekt", () => {
    const values = { ...EMPTY_NEW_TASK_VALUES, dueDate: "2026-12-24" }
    expect(applyProject(values, "p2", options, false, TODAY)).toEqual({
      ...values,
      projectId: "p2",
    })
  })
})

describe("getFieldMessage", () => {
  it("bildet Codes je Feld auf Meldungen ab", () => {
    const v = t.validation
    expect(getFieldMessage("required", "name", v)).toBe(v.required.name)
    expect(getFieldMessage("required", "projectId", v)).toBe(
      v.required.projectId
    )
    expect(getFieldMessage("required", "dueDate", v)).toBe(v.required.dueDate)
    expect(getFieldMessage("required", "priority", v)).toBeUndefined()
    expect(getFieldMessage("invalid", "dueDate", v)).toBe(v.invalidDate)
    expect(getFieldMessage("invalid", "projectId", v)).toBe(v.invalid)
    expect(getFieldMessage("tooLong", "description", v)).toBe(v.tooLong)
    expect(getFieldMessage(undefined, "name", v)).toBeUndefined()
  })
})

describe("getSubmitErrorMessage", () => {
  it("bildet API-Fehlercodes auf Meldungen ab", () => {
    const e = t.errors
    expect(getSubmitErrorMessage("unauthorized", e)).toBe(e.sessionExpired)
    expect(getSubmitErrorMessage("forbidden", e)).toBe(e.forbidden)
    expect(getSubmitErrorMessage("invalid_project", e)).toBe(e.invalidProject)
    expect(getSubmitErrorMessage("network_error", e)).toBe(e.timeout)
    expect(getSubmitErrorMessage("server_error", e)).toBe(e.saveError)
  })
})
