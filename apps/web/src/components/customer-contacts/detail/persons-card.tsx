import type { CustomerContactPerson } from "@/models/customer-contact"
import { Card } from "@/components/shared/card"
import { PersonsTable, type PersonsTableLabels } from "./persons-table"

export function PersonsCard({
  persons,
  title,
  emptyLabel,
  columnLabels,
}: {
  persons: CustomerContactPerson[]
  title: string
  emptyLabel: string
  columnLabels: PersonsTableLabels
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-bold text-foreground">
        {title} ({persons.length})
      </h2>
      {persons.length ? (
        <PersonsTable persons={persons} labels={columnLabels} />
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </Card>
  )
}
