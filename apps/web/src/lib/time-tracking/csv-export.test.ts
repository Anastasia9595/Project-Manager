import { describe, expect, it } from "vitest"

import { buildWeekCsv, weekCsvFileName } from "@/lib/time-tracking/csv-export"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"

const LABELS = {
  date: "Datum",
  project: "Projekt",
  projectId: "Projekt-ID",
  task: "Aufgabe",
  duration: "Dauer (h:mm)",
  minutes: "Dauer (Minuten)",
  description: "Beschreibung",
}

const PROJECT = {
  id: "p1",
  name: "JB-2026-001",
  title: "Jahresbericht 2026",
} as Project

const TASK = { id: "t1", title: "Korrektur", projectId: "p1" } as TrackedTask

describe("buildWeekCsv", () => {
  it("schreibt eine Zeile je Buchung, nach Datum sortiert", () => {
    const csv = buildWeekCsv(
      [
        { id: "b", project: "p1", task: "t1", date: "2026-10-14", duration_minutes: 70, description: "Text; mit \"Zitat\"", user: "u" },
        { id: "a", project: "p1", task: "t1", date: "2026-10-12", duration_minutes: 30, description: null, user: "u" },
      ],
      [PROJECT],
      [TASK],
      LABELS
    )
    expect(csv.split("\r\n")).toEqual([
      "Datum;Projekt;Projekt-ID;Aufgabe;Dauer (h:mm);Dauer (Minuten);Beschreibung",
      "12.10.2026;Jahresbericht 2026;JB-2026-001;Korrektur;0:30;30;",
      '14.10.2026;Jahresbericht 2026;JB-2026-001;Korrektur;1:10;70;"Text; mit ""Zitat"""',
    ])
  })

  it("entschärft Formeln am Zellanfang", () => {
    const csv = buildWeekCsv(
      [{ id: "a", project: "p1", task: "t1", date: "2026-10-12", duration_minutes: 30, description: "=HYPERLINK(1)", user: "u" }],
      [PROJECT],
      [TASK],
      LABELS
    )
    expect(csv.split("\r\n")[1]!.endsWith(";'=HYPERLINK(1)")).toBe(true)
  })

  it("benennt die Datei nach der Woche", () => {
    expect(weekCsvFileName(new Date(2026, 9, 12))).toBe("zeiterfassung-2026-W42.csv")
  })
})
