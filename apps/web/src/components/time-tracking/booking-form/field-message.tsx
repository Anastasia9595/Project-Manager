import type { ReactNode } from "react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@workspace/ui/lib/utils"

type Tone = "error" | "warning" | "hint"

const TONE_CLASS: Record<Tone, string> = {
  error: "text-destructive",
  warning: "rounded-xl bg-warning-tint px-3 py-2 text-warning-on-tint",
  hint: "text-muted-foreground",
}

/** Text unter einem Feld: Fehler (rot), Warnung (nicht blockierend) oder Hinweis (grau). */
export function FieldMessage({
  id,
  tone,
  children,
}: {
  id?: string
  tone: Tone
  children: ReactNode
}) {
  return (
    <p
      id={id}
      // Fehler und Warnungen werden beim Erscheinen vorgelesen.
      aria-live={tone === "hint" ? undefined : "polite"}
      className={cn("flex items-center gap-2 text-xs", TONE_CLASS[tone])}
    >
      {tone === "warning" && (
        <HugeiconsIcon
          icon={Alert02Icon}
          strokeWidth={2}
          className="size-4 shrink-0"
          aria-hidden
        />
      )}
      {children}
    </p>
  )
}
