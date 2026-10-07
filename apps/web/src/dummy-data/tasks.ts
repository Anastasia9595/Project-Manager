import type { Task } from "@/models/task"
import { addDays } from "@/lib/week"

// TODO: durch Directus-Daten ersetzen (z.B. per `readItems("tasks", ...)`).
// `MyTasks` erwartet nur Felder aus dem `Task`-Typ - solange die Directus-Response
// darauf gemappt wird, bleibt der Rest der Komponente unverändert.
// Die Dummy-Termine liegen relativ zu heute, damit die Liste nie leer ist.
function createDummyTasks(today: Date): Task[] {
  return [
    {
      id: "1",
      title: "Briefing & Freigabe",
      projectName: "WeWo_1925-2225_Landingpage_40-Nachrichten",
      priority: "high",
      dueDate: today,
      done: false,
    },
    {
      id: "2",
      title: "Briefing & Freigabe",
      projectName: "WeWo_4326_Zusteller-Langkarte_Moebelhaus",
      priority: "high",
      dueDate: today,
      done: false,
    },
    {
      id: "3",
      title: "Briefing & Freigabe",
      projectName: "WeWo_4326_Zusteller-Langkarte_Moebelhaus",
      priority: "high",
      dueDate: today,
      done: false,
    },
    {
      id: "4",
      title: "Aufstellung Konzept",
      projectName: "MZG_3826_Aussenbanner_noch_5_Minuten",
      priority: "medium",
      dueDate: today,
      done: false,
    },
    {
      id: "5",
      title: "Korrekturlauf Anzeige",
      projectName: "Wallach_5226_Anzeige_Gutscheine_12-2026",
      priority: "low",
      dueDate: today,
      done: false,
    },
    {
      id: "6",
      title: "Datenübergabe vorbereiten",
      projectName: "Wallach_5226_Anzeige_Gutscheine_12-2026",
      priority: "high",
      dueDate: addDays(today, 1),
      done: false,
    },
    {
      id: "7",
      title: "Layout abstimmen",
      projectName: "WohnSchick_3726_Wandkonzept_Eigenmarke",
      priority: "medium",
      dueDate: addDays(today, 2),
      done: false,
    },
  ]
}

export const DUMMY_TASKS: Task[] = createDummyTasks(new Date())
