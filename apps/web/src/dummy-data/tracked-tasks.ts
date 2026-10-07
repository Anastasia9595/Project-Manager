import { DUMMY_PROJECTS } from "@/dummy-data/projects"
import { addDays } from "@/lib/week"
import type { TaskPriority, TimeEntry, TrackedTask } from "@/models/task"

// TODO: durch Directus-Daten ersetzen (z.B. per `readItems("tasks", ...)` inkl. Zeiteinträgen).
// Projektnamen und Kunden stammen aus `DUMMY_PROJECTS`, damit beide Seiten zusammenpassen.
// Fälligkeiten und Zeiteinträge liegen relativ zu heute, damit alle Gruppen gefüllt sind.

type DummyTaskSpec = {
  title: string
  projectIndex: number
  priority: TaskPriority
  /** Fälligkeit relativ zu heute (negativ = überfällig). */
  dueInDays: number
  /** Erfasste Zeiten als [Tage zurück, Minuten]. */
  entries: [daysAgo: number, minutes: number][]
}

const SPECS: DummyTaskSpec[] = [
  {
    title: "Aufstellung",
    projectIndex: 0,
    priority: "high",
    dueInDays: -3,
    entries: [
      [0, 45],
      [2, 110],
    ],
  },
  {
    title: "Korrektur",
    projectIndex: 1,
    priority: "high",
    dueInDays: -2,
    entries: [[1, 95]],
  },
  {
    title: "Layout",
    projectIndex: 2,
    priority: "medium",
    dueInDays: -2,
    entries: [
      [0, 60],
      [3, 180],
    ],
  },
  {
    title: "Briefing",
    projectIndex: 3,
    priority: "low",
    dueInDays: -1,
    entries: [[0, 30]],
  },
  {
    title: "Aufbau Webseite",
    projectIndex: 4,
    priority: "low",
    dueInDays: -1,
    entries: [[1, 155]],
  },
  {
    title: "Aufstellung",
    projectIndex: 2,
    priority: "medium",
    dueInDays: 0,
    entries: [
      [0, 57],
      [1, 98],
    ],
  },
  {
    title: "Korrektur",
    projectIndex: 3,
    priority: "low",
    dueInDays: 0,
    entries: [[2, 95]],
  },
  {
    title: "Layout",
    projectIndex: 4,
    priority: "low",
    dueInDays: 0,
    entries: [[1, 240]],
  },
  {
    title: "Datenübergabe",
    projectIndex: 0,
    priority: "high",
    dueInDays: 0,
    entries: [],
  },
  {
    title: "Aufstellung",
    projectIndex: 0,
    priority: "high",
    dueInDays: 1,
    entries: [[3, 155]],
  },
  {
    title: "Korrektur",
    projectIndex: 1,
    priority: "high",
    dueInDays: 2,
    entries: [[4, 95]],
  },
  {
    title: "Layout",
    projectIndex: 2,
    priority: "medium",
    dueInDays: 3,
    entries: [[2, 240]],
  },
  {
    title: "Reinzeichnung",
    projectIndex: 3,
    priority: "medium",
    dueInDays: 4,
    entries: [],
  },
  {
    title: "Freigabe einholen",
    projectIndex: 4,
    priority: "low",
    dueInDays: 5,
    entries: [],
  },
  {
    title: "Druckdaten prüfen",
    projectIndex: 1,
    priority: "medium",
    dueInDays: 6,
    entries: [],
  },
  {
    title: "Bildrecherche",
    projectIndex: 4,
    priority: "low",
    dueInDays: 7,
    entries: [[5, 40]],
  },
]

function createEntries(
  taskId: string,
  today: Date,
  entries: DummyTaskSpec["entries"]
): TimeEntry[] {
  return entries.map(([daysAgo, minutes]) => {
    const day = addDays(today, -daysAgo)
    // Startzeit 08:00 Uhr - so zählt ein Eintrag von "heute" sicher zum heutigen Tag.
    day.setHours(8)
    return { taskId, startedAt: day, seconds: minutes * 60 }
  })
}

function createDummyTrackedTasks(today: Date): TrackedTask[] {
  return SPECS.map((spec, index) => {
    const id = `task-${index + 1}`
    const project = DUMMY_PROJECTS[spec.projectIndex % DUMMY_PROJECTS.length]!
    return {
      id,
      title: spec.title,
      projectName: project.name,
      customer: project.customer,
      priority: spec.priority,
      dueDate: addDays(today, spec.dueInDays),
      done: false,
      timeEntries: createEntries(id, today, spec.entries),
    }
  })
}

export const DUMMY_TRACKED_TASKS: TrackedTask[] = createDummyTrackedTasks(
  new Date()
)
