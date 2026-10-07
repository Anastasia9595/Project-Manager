export type ProjectStatus = "created" | "active" | "paused" | "completed"

export type Project = {
  id: string
  name: string
  status: ProjectStatus
  palDate: Date
  dataHandoverDate: Date
  customer: string
  progress: { done: number; total: number },
  circulation: number,
}
