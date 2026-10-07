import type { IconSvgElement } from "@hugeicons/react"

export type ProjectStatTone = "error" | "warning" | "success" | "neutral"

export type ProjectStat = {
  label: string
  value: number
  unit: string
  icon: IconSvgElement
  tone: ProjectStatTone
}
