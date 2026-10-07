import type * as React from "react"

import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

/** Textfeld in der Höhe der Einstellungsformulare. */
export function SettingsInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return <Input className={cn("h-12", className)} {...props} />
}
