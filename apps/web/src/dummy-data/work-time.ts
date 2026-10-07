import type { WorkDay } from "@/models/work-day"

// TODO: durch Zeiterfassungs-Daten aus Directus ersetzen. `WeeklyWorkTime`
// erwartet nur Felder aus dem `WorkDay`-Typ - solange die Response darauf
// gemappt wird, bleibt das Diagramm unverändert.
export const DUMMY_WORK_WEEK: WorkDay[] = [
  { label: "MON", name: "Montag", targetHours: 8, actualHours: 7.5 },
  { label: "DIE", name: "Dienstag", targetHours: 8, actualHours: 8 },
  { label: "MIT", name: "Mittwoch", targetHours: 8, actualHours: 9 },
  { label: "DON", name: "Donnerstag", targetHours: 8, actualHours: 7 },
  { label: "FRE", name: "Freitag", targetHours: 8, actualHours: 3 },
]
