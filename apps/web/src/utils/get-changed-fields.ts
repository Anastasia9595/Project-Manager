export type ChangedField = { key: string; label: string; value: string }

/** Felder, deren Wert sich gegenüber `saved` geändert hat, mit Beschriftung und neuem Wert. */
export function getChangedFields<T extends Record<string, string>>(
  saved: T,
  values: T,
  labels: Record<keyof T, string>
): ChangedField[] {
  return (Object.keys(values) as (keyof T & string)[])
    .filter((key) => values[key] !== saved[key])
    .map((key) => ({ key, label: labels[key], value: values[key] }))
}
