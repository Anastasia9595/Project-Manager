export type ProjectStatus = "created" | "active" | "paused" | "completed"

export type Project = {
  id: string
  /** Interner Projektname, z.B. "WeWo_1925-2225_Landingpage_40-Nachrichten". */
  name: string
  /** Lesbarer Klarname; ohne Angabe wird `name` angezeigt. */
  title?: string
  status: ProjectStatus
  palDate: Date
  dataHandoverDate: Date
  customer: string
  progress: { done: number; total: number },
  circulation: number,
}
