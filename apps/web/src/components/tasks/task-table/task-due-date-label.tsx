import { getRelativeDueInfo, type DueTone } from "@/lib/due-date"

const DUE_TONE_CLASSNAME: Record<DueTone, string> = {
  overdue: "text-destructive",
  today: "text-warning-dark",
  upcoming: "text-table-foreground",
}

export function TaskDueDateLabel({ date }: { date: Date }) {
  const due = getRelativeDueInfo(date)
  return (
    <span className={`text-xs ${DUE_TONE_CLASSNAME[due.tone]}`}>
      {due.label}
    </span>
  )
}
