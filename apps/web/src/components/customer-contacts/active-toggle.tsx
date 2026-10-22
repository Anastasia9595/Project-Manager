import { useId } from "react"

import { Switch } from "@workspace/ui/components/switch"

/** Schalter "Aktiver Kontakt" als ganze, klickbare Zeile mit Erklärtext. */
export function ActiveToggle({
  checked,
  onCheckedChange,
  label,
  hint,
  className,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  hint: string
  className?: string
}) {
  const labelId = useId()
  const hintId = useId()

  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-input bg-input/30 px-4 py-3 ${className ?? ""}`}
    >
      <span className="flex flex-col gap-1">
        <span id={labelId} className="text-sm font-semibold">
          {label}
        </span>
        <span id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </span>
      </span>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-labelledby={labelId}
        aria-describedby={hintId}
      />
    </label>
  )
}
