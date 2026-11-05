import type {
  DueDateAnchor,
  TaskOptionRows,
  TaskOptions,
} from "./new-task.types"
import type { NewTaskValues } from "./new-task.values"

type ProjectDates = {
  palDate: string | null
  deliveryDate: string | null
  distributionDate: string | null
}

/** Fälligkeit aus Anker + Offset (Tage), rein in UTC; "" wenn das Ankerdatum fehlt. */
export function computeDueDate(
  template: { anchor: DueDateAnchor; offset: number },
  project: ProjectDates | undefined,
  today: string
): string {
  const base =
    template.anchor === "date_created"
      ? today
      : template.anchor === "pal_date"
        ? project?.palDate
        : template.anchor === "delivery_date"
          ? project?.deliveryDate
          : project?.distributionDate
  if (!base) return ""
  const date = new Date(`${base}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + template.offset)
  return date.toISOString().slice(0, 10)
}

export function toTaskPayload(
  values: NewTaskValues,
  userId: string
): Record<string, unknown> {
  return {
    task_name: values.name.trim(),
    description: values.description.trim() || null,
    priority: values.priority,
    due_date: values.dueDate,
    printing_lines: values.projectId,
    assigned_to: userId,
    status: "published",
    completed: false,
  }
}

export function toTaskOptions(rows: TaskOptionRows): TaskOptions {
  return {
    projects: rows.projects.map((r) => ({
      id: r.id,
      name: r.name ?? "",
      customer: r.tenant?.tenant_name ?? "",
      palDate: r.pal_date,
      deliveryDate: r.delivery_date,
      distributionDate: r.distribution_date,
    })),
    templates: rows.templates.map((r) => ({
      id: r.id,
      name: r.task_name,
      description: r.description ?? "",
      anchor: r.due_date_anchor,
      offset: r.due_date_offset,
    })),
  }
}
