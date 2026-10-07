"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@workspace/ui/components/data-table"

import type { CustomerContactPerson } from "@/models/customer-contact"
import { sortableHeader } from "@/utils/sortable-header"
import { InitialsAvatar } from "@/components/shared/initials-avatar"

export type PersonsTableLabels = {
  name: string
  position: string
  phone: string
  email: string
}

function getColumns(
  labels: PersonsTableLabels
): ColumnDef<CustomerContactPerson, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: sortableHeader(labels.name),
      cell: ({ row }) => (
        <div className="flex items-center gap-3 font-medium whitespace-nowrap text-foreground">
          <InitialsAvatar
            name={row.original.name}
            size="sm"
            fallbackClassName="text-[10px]"
          />
          {row.original.name}
        </div>
      ),
    },
    { accessorKey: "position", header: sortableHeader(labels.position) },
    { accessorKey: "phone", header: sortableHeader(labels.phone) },
    { accessorKey: "email", header: sortableHeader(labels.email) },
  ]
}

export function PersonsTable({
  persons,
  labels,
}: {
  persons: CustomerContactPerson[]
  labels: PersonsTableLabels
}) {
  return <DataTable columns={getColumns(labels)} data={persons} />
}
