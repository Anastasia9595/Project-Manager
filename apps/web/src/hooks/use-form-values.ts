import { useState } from "react"

/**
 * Zustand eines Formulars aus Textfeldern.
 * - `bind(key)` liefert `value`, `onChange` und `aria-invalid` für ein Feld.
 * - `isDirty` ist wahr, sobald ein Wert vom zuletzt gespeicherten Stand abweicht.
 * - `commit()` übernimmt die aktuellen Werte als gespeicherten Stand.
 */
export function useFormValues<T extends Record<string, string>>(initial: T) {
  const [saved, setSaved] = useState(initial)
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})

  const bind = (key: keyof T) => ({
    value: values[key],
    "aria-invalid": errors[key] ? true : undefined,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setValues((current) => ({ ...current, [key]: event.target.value }))
      setErrors((current) => ({ ...current, [key]: undefined }))
    },
  })

  const isDirty = (Object.keys(values) as (keyof T)[]).some(
    (key) => values[key] !== saved[key]
  )

  return {
    values,
    saved,
    errors,
    setErrors,
    bind,
    isDirty,
    commit: () => setSaved(values),
    reset: () => {
      setValues(initial)
      setSaved(initial)
      setErrors({})
    },
  }
}
