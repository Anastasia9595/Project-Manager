import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { getRelativeDueInfo, type DueTone } from "@/lib/due-date"

// Nur der Zusatz ist farbig, damit viele überfällige Zeilen nicht alles überstrahlen.
const NOTE_CLASSNAME: Record<DueTone, string> = {
  overdue: "text-destructive-dark dark:text-destructive",
  today: "text-warning-on-tint dark:text-due-soon",
  upcoming: "",
}

/** Nur der Zusatz ("vor 3 Tagen", "heute"); ohne Zusatz nichts. */
export function TaskDueNote({ date }: { date: Date }) {
  const due = getRelativeDueInfo(date)
  return (
    due.note && <span className={NOTE_CLASSNAME[due.tone]}>{due.note}</span>
  )
}

export function TaskDueDateLabel({
  date,
  hideNote,
}: {
  date: Date
  hideNote?: boolean
}) {
  const due = getRelativeDueInfo(date)
  return (
    <span className="inline-flex items-center gap-1.5 text-table-foreground">
      <HugeiconsIcon
        icon={Calendar03Icon}
        aria-hidden
        className="size-3.5 shrink-0"
      />
      <span>
        {due.label}
        {due.note && !hideNote && (
          <>
            {" · "}
            <TaskDueNote date={date} />
          </>
        )}
      </span>
    </span>
  )
}
