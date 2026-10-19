import type { DueFooter, DueFooterTone } from "@/lib/calendar/due-footer"

const TONE_CLASSNAME: Record<DueFooterTone, string> = {
  overdue: "text-destructive",
  today: "text-due-today",
  soon: "text-due-soon",
  later: "text-table-foreground",
  done: "text-table-foreground",
}

export function CalendarDueFooter({ footer }: { footer: DueFooter }) {
  return (
    <p
      className={`text-[11px] leading-tight font-medium ${TONE_CLASSNAME[footer.tone]}`}
    >
      {footer.label}
    </p>
  )
}
