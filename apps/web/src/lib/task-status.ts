import type { Task } from "@/models/task"

/** Arbeitsstand einer Aufgabe – unabhängig von ihrer Fälligkeit. */
export type TaskWorkStatus = "open" | "inProgress" | "done"

/**
 * Erledigt -> Abgeschlossen; Zeit erfasst -> In Bearbeitung; sonst Offen.
 * `startedTaskIds` enthält alle Aufgaben, auf die schon Zeit gebucht wurde.
 */
export function getTaskWorkStatus(
  task: Pick<Task, "id" | "done">,
  startedTaskIds: ReadonlySet<string>
): TaskWorkStatus {
  if (task.done) return "done"
  return startedTaskIds.has(task.id) ? "inProgress" : "open"
}
