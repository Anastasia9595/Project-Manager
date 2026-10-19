import type { Dictionary } from "@/i18n"
import { type WeekTotals } from "@/lib/time-tracking/calculations/totals"
import {
  type OverviewProjectGroup,
  type OverviewSort,
  type OverviewSortKey,
} from "@/lib/time-tracking/calculations/week-overview"
import type { TimeBooking } from "@/models/time-booking"

export type OverviewLabels = Dictionary["timeTrackingPage"]["overview"]
export type PopoverLabels = Dictionary["timeTrackingPage"]["popover"]

/** Zelle der Wochenübersicht – Grundlage zum Vorbefüllen des Formulars. */
export type CellTarget = { projectId: string; taskId: string; date: Date }

/** Aktionen, die aus Zellen und Popover heraus ausgelöst werden. */
export type CellActions = {
  onAdd: (target: CellTarget) => void
  onEdit: (entry: TimeBooking) => void
  /** `false`, wenn das Löschen fehlgeschlagen ist. */
  onDelete: (entry: TimeBooking) => Promise<boolean>
}

export type WeekOverviewTableProps = CellActions & {
  groups: OverviewProjectGroup[]
  days: Date[]
  today: Date
  /** Buchungen der Woche – für die Einzeleinträge im Popover. */
  entries: TimeBooking[]
  totals: WeekTotals
  sort: OverviewSort | null
  onSort: (key: OverviewSortKey) => void
  labels: OverviewLabels
  popoverLabels: PopoverLabels
}

/** Props einer Tageszelle (gefüllt oder leer). */
export type CellProps = CellActions & {
  target: CellTarget
  taskTitle: string
  projectTitle: string
  entries: TimeBooking[]
  isFuture: boolean
  labels: OverviewLabels
  popoverLabels: PopoverLabels
}

/** Gemeinsamer Stil der Zellen-Buttons (gefüllt und leer). */
export const CELL_BUTTON_CLASS =
  "group relative inline-flex w-full items-center justify-center rounded-xl border border-transparent px-2 py-1.5 tabular-nums outline-none transition-colors hover:border-primary hover:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-expanded:border-primary aria-expanded:bg-card"

/** Heutige Spalte: dezent getönt hervorgehoben. */
export const TODAY_COLUMN_CLASS = "bg-secondary"
