import {
  Calendar01FreeIcons,
  ChartBarLineIcon,
  Clock01Icon,
  TriangleAlertIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import type { ProjectStat } from "@/models/project-stat"

// TODO: durch echte Zahlen aus Directus ersetzen
export const DUMMY_STATS: Omit<ProjectStat, "unit">[] = [
  { label: "Überfällig", value: 4, icon: TriangleAlertIcon as IconSvgElement, tone: "error" },
  { label: "Heute fällig", value: 2, icon: Clock01Icon as IconSvgElement, tone: "warning" },
  { label: "Diese Woche", value: 12, icon: Calendar01FreeIcons as IconSvgElement, tone: "success" },
  { label: "Anstehend", value: 10, icon: ChartBarLineIcon as IconSvgElement, tone: "neutral" },
]
