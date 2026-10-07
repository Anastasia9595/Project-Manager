import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"

export function InfoRow({
  icon,
  children,
}: {
  icon: IconSvgElement
  children: string
}) {
  return (
    <li className="flex items-center gap-3 text-sm text-foreground">
      <HugeiconsIcon icon={icon} className="size-4 shrink-0 text-primary" />
      <span className="min-w-0 wrap-break-word">{children}</span>
    </li>
  )
}
