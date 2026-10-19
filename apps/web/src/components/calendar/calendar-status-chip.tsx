import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Badge } from "@workspace/ui/components/badge"

import type { CalendarEntryStatus } from "@/models/calendar-entry"

const STATUS_STYLE: Record<
  CalendarEntryStatus,
  { icon: IconSvgElement; className: string }
> = {
  overdue: {
    icon: AlertCircleIcon,
    className: "bg-destructive-tint text-destructive-dark",
  },
  inProgress: {
    icon: Clock01Icon,
    className: "bg-warning-tint text-warning-on-tint",
  },
  open: {
    icon: CircleIcon,
    className: "bg-secondary text-secondary-foreground",
  },
  done: {
    icon: CheckmarkCircle02Icon,
    className: "bg-success-tint text-success-dark",
  },
}

export function CalendarStatusChip({
  status,
  label,
}: {
  status: CalendarEntryStatus
  label: string
}) {
  const { icon, className } = STATUS_STYLE[status]
  return (
    <Badge className={`rounded-md font-semibold ${className}`}>
      <HugeiconsIcon icon={icon} strokeWidth={2} aria-hidden />
      {label}
    </Badge>
  )
}
