import { useId } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Call02Icon,
  Mail01Icon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"

import {
  CONTACT_METHODS,
  type ContactMethod,
} from "@/lib/customer-contact-form/fields"

const ICONS = {
  email: Mail01Icon,
  phone: Call02Icon,
  mobile: SmartPhone01Icon,
} as const satisfies Record<ContactMethod, unknown>

/**
 * Auswahl des bevorzugten Kontaktwegs als Karten: genau eine Option oder keine.
 * Ein Klick auf die gewählte Option hebt die Auswahl wieder auf.
 */
export function ContactMethodPicker({
  value,
  onChange,
  legend,
  hint,
  labels,
}: {
  value: "" | ContactMethod
  onChange: (value: "" | ContactMethod) => void
  legend: string
  hint: string
  labels: Record<ContactMethod, string>
}) {
  const name = useId()
  const hintId = useId()

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={hintId}>
      <legend className="mb-2 text-sm font-semibold">{legend}</legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {CONTACT_METHODS.map((method) => (
          <label
            key={method}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-4xl border border-input bg-input/30 px-4 text-sm font-medium transition-colors hover:bg-input/60 has-checked:border-primary has-checked:bg-primary/10 has-checked:text-primary has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={name}
              value={method}
              checked={value === method}
              onChange={() => onChange(method)}
              onClick={() => value === method && onChange("")}
              className="sr-only"
            />
            {labels[method]}
            <HugeiconsIcon icon={ICONS[method]} className="size-4" />
          </label>
        ))}
      </div>
      <p id={hintId} className="text-xs text-muted-foreground">
        {hint}
      </p>
    </fieldset>
  )
}
