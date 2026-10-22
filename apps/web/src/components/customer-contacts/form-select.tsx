import { useMemo } from "react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import type { FieldAria } from "@/components/settings/form-field"
import type { SelectOption } from "@/lib/customer-contact-form/options"

/**
 * Auswahlfeld mit String-Wert ("" = nichts gewählt).
 * `emptyLabel` fügt der Liste einen Eintrag zum Zurücksetzen hinzu; ohne ihn bleibt die Auswahl bestehen.
 * `aria` kommt von `FormField` und verknüpft Pflichtstatus und Fehlertext mit dem Feld.
 */
export function FormSelect({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  emptyLabel,
  disabled,
  invalid,
  aria,
}: {
  id: string
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  emptyLabel?: string
  disabled?: boolean
  invalid?: boolean
  aria?: FieldAria
}) {
  const items = useMemo(
    () => [
      ...(emptyLabel ? [{ value: null, label: emptyLabel }] : []),
      ...options,
    ],
    [emptyLabel, options]
  )

  return (
    <Select
      items={items}
      value={value || null}
      onValueChange={(next) => onValueChange(next ?? "")}
      disabled={disabled}
    >
      <SelectTrigger id={id} aria-invalid={invalid ? true : undefined} {...aria}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value ?? "empty"} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
