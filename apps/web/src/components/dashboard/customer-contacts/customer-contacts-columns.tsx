import type { ColumnDef } from "@tanstack/react-table"

import { getCustomerContactHref } from "@/lib/customer-contacts"
import type { CustomerContact } from "@/models/customer-contact"
import { sortableHeader } from "@/utils/sortable-header"
import { CustomerCell } from "./customer-cell"

type Column = ColumnDef<CustomerContact, unknown>

function getCustomerColumn(
  locale: string | undefined,
  linkToDetail: boolean
): Column {
  return {
    accessorKey: "customer",
    header: sortableHeader("Kunde"),
    cell: ({ row }) => (
      <CustomerCell
        contact={row.original}
        href={
          linkToDetail
            ? getCustomerContactHref(row.original.id, locale)
            : undefined
        }
      />
    ),
  }
}

const contactPersonColumn: Column = {
  accessorKey: "contactPerson",
  header: sortableHeader("Ansprechpartner"),
  cell: ({ row }) => (
    <span className="font-medium whitespace-nowrap text-foreground">
      {row.original.contactPerson}
    </span>
  ),
}

// Kompakte Spalten fuers Dashboard-Widget: nur die wichtigsten Infos auf schmalem Raum.
export function getCompactColumns(locale?: string): Column[] {
  return [
    getCustomerColumn(locale, false),
    contactPersonColumn,
    { accessorKey: "email", header: sortableHeader("Kontakt") },
  ]
}

// Vollstaendige Spalten fuer die Kundenkontakte-Seite.
export function getDetailedColumns(locale?: string): Column[] {
  return [
    getCustomerColumn(locale, true),
    contactPersonColumn,
    { accessorKey: "website", header: sortableHeader("Website") },
    { accessorKey: "email", header: sortableHeader("E-Mail") },
    { accessorKey: "phone", header: sortableHeader("Telefonnummer") },
    { accessorKey: "address", header: sortableHeader("Adresse") },
    { accessorKey: "association", header: sortableHeader("Verband") },
  ]
}
