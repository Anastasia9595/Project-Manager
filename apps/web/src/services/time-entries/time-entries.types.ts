/** Zeile aus `time_entries`, nur die geladenen Felder (`work_date` als "YYYY-MM-DD"). */
export type TimeEntryRow = {
  work_date: string
  hours: number | null
  minutes: number | null
}
