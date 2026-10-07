import type { ChangedField } from "@/utils/get-changed-fields"

/** Liste der gespeicherten Felder mit ihrem neuen Wert. */
export function ChangedFieldsList({ fields }: { fields: ChangedField[] }) {
  return (
    <dl className="mt-4 flex flex-col gap-1 text-sm">
      {fields.map(({ key, label, value }) => (
        <div key={key} className="flex justify-center gap-2">
          <dt className="text-muted-foreground">{label}:</dt>
          <dd className="font-medium break-all text-foreground">
            {value || "–"}
          </dd>
        </div>
      ))}
    </dl>
  )
}
