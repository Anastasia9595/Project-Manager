export type PrintingLineStatus =
  "created" | "in progress" | "completed" | "invoiced" | "cancelled"

/** Zeile aus `printing_lines`, nur die geladenen Felder. */
export type PrintingLineRow = {
  id: string
  name: string | null
  status: PrintingLineStatus | null
  pal_date: string | null
  buffer_days: number | null
  circulation: number | null
  tenant: { tenant_name: string | null } | null
  tasks: { completed: boolean | null }[] | null
}
