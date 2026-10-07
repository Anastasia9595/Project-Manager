"use client"

import { useMemo } from "react"

import {
  DataTable,
  type DataTablePaginationLabels,
} from "@workspace/ui/components/data-table"

import { DUMMY_CUSTOMER_CONTACTS } from "@/dummy-data/customer-contacts"
import type { CustomerContact } from "@/models/customer-contact"
import {
  getCompactColumns,
  getDetailedColumns,
} from "./customer-contacts-columns"

export function CustomerContactsTable({
  contacts = DUMMY_CUSTOMER_CONTACTS,
  title,
  compact = false,
  pageSize,
  paginationLabels,
  locale,
}: {
  contacts?: CustomerContact[]
  title?: string
  /** Reduzierter Spaltensatz fuer schmale Container, z.B. das Dashboard-Widget. */
  compact?: boolean
  pageSize?: number
  paginationLabels?: DataTablePaginationLabels
  locale?: string
}) {
  const columns = useMemo(
    () => (compact ? getCompactColumns(locale) : getDetailedColumns(locale)),
    [compact, locale]
  )

  return (
    <div className="min-w-0 rounded-3xl border border-border bg-card p-6">
      {title && (
        <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>
      )}
      <DataTable
        columns={columns}
        data={contacts}
        pageSize={pageSize}
        paginationLabels={paginationLabels}
      />
    </div>
  )
}
