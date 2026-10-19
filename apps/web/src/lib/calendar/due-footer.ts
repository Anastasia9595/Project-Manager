import { diffInCalendarDays } from "@/lib/due-date"
import de from "@/i18n/de"
import { fillTemplate } from "@/utils/fill-template"

export type DueFooterTone = "overdue" | "today" | "soon" | "later" | "done"

export type DueFooter = {
  label: string
  tone: DueFooterTone
}

export type DueFooterLabels = typeof de.calendarPage.footer

/** "TT.MM", z.B. 02.10 */
export function formatDayMonth(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${day}.${month}`
}

/**
 * Fußzeile einer Kalender-Card relativ zu `today`:
 * überfällig (rot), heute (orange), in 1-2 Tagen (amber), später/abgeschlossen (grau).
 */
export function getDueFooter(
  item: { dueDate: Date; done: boolean; completedAt?: Date },
  today: Date,
  labels: DueFooterLabels = de.calendarPage.footer
): DueFooter {
  if (item.done) {
    return {
      tone: "done",
      label: item.completedAt
        ? fillTemplate(labels.done, { date: formatDayMonth(item.completedAt) })
        : labels.doneWithoutDate,
    }
  }

  const days = diffInCalendarDays(item.dueDate, today)
  const date = formatDayMonth(item.dueDate)

  if (days < 0) {
    const template = days === -1 ? labels.overdueYesterday : labels.overdue
    return {
      tone: "overdue",
      label: fillTemplate(template, { date, days: -days }),
    }
  }
  if (days === 0) {
    return { tone: "today", label: labels.today }
  }
  if (days <= 2) {
    const template = days === 1 ? labels.tomorrow : labels.soon
    return { tone: "soon", label: fillTemplate(template, { date, days }) }
  }
  return { tone: "later", label: fillTemplate(labels.later, { date }) }
}
