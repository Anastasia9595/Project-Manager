import { getWorkweekDays } from "@/lib/week"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"

// Gemeinsame Testdaten der Rechenfunktionen: Woche KW 42/2026 (Mo 12.10.).

export const WEEK_START = new Date(2026, 9, 12)
export const DAYS = getWorkweekDays(WEEK_START)
export const WEDNESDAY = new Date(2026, 9, 14, 15)

export function booking(overrides: Partial<TimeBooking>): TimeBooking {
  return {
    id: "e1",
    project: "p1",
    task: "t1",
    date: "2026-10-12",
    duration_minutes: 60,
    description: null,
    user: "u1",
    ...overrides,
  }
}

export function project(id: string, title: string): Project {
  return {
    id,
    name: `${id}_intern`,
    title,
    status: "active",
    palDate: WEEK_START,
    dataHandoverDate: WEEK_START,
    customer: "Kunde",
    progress: { done: 0, total: 1 },
    circulation: 0,
  }
}

export function task(id: string, projectId: string, title: string): TrackedTask {
  return {
    id,
    title,
    projectId,
    projectName: `${projectId}_intern`,
    customer: "Kunde",
    priority: "medium",
    dueDate: WEEK_START,
    done: false,
    timeEntries: [],
  }
}
