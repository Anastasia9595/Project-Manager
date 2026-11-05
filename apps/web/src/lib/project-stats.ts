import {
  Calendar01FreeIcons,
  ChartBarLineIcon,
  Clock01Icon,
  TriangleAlertIcon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { addDays, startOfWeek, toDayKey } from "@/lib/week"
import type { Project } from "@/models/project"
import type { ProjectStat } from "@/models/project-stat"

/** Kennzahlen des Dashboards: offene Projekte nach PAL-Datum relativ zu `today`. */
export function getProjectStats(
  projects: Project[],
  today: Date
): Omit<ProjectStat, "unit">[] {
  // Tages-Schlüssel ("YYYY-MM-DD") vergleichen sich wie Daten, ohne Uhrzeit
  const todayKey = toDayKey(today)
  const weekEndKey = toDayKey(addDays(startOfWeek(today), 6))
  const palKeys = projects
    .filter((project) => project.status !== "completed")
    .map((project) => toDayKey(project.palDate))
  const count = (match: (key: string) => boolean) =>
    palKeys.filter(match).length

  return [
    {
      label: "Überfällig",
      value: count((key) => key < todayKey),
      icon: TriangleAlertIcon as IconSvgElement,
      tone: "error",
    },
    {
      label: "Heute fällig",
      value: count((key) => key === todayKey),
      icon: Clock01Icon as IconSvgElement,
      tone: "warning",
    },
    {
      label: "Diese Woche",
      value: count((key) => key > todayKey && key <= weekEndKey),
      icon: Calendar01FreeIcons as IconSvgElement,
      tone: "success",
    },
    {
      label: "Anstehend",
      value: count((key) => key > weekEndKey),
      icon: ChartBarLineIcon as IconSvgElement,
      tone: "neutral",
    },
  ]
}
