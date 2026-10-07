"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import {
  type Column,
  type ColumnDef,
  type SortingState,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import * as React from "react"

import { Button } from "./button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: {
  column: Column<TData, TValue>
  title: string
}) {
  if (!column.getCanSort()) {
    return <span>{title}</span>
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      <HugeiconsIcon icon={ArrowUpDownIcon} className="size-3.5" />
    </Button>
  )
}

export type DataTablePaginationLabels = {
  /** Word between range and total, e.g. "von" -> "1 - 10 von 284" */
  of: string
  previous: string
  next: string
}

const DEFAULT_PAGINATION_LABELS: DataTablePaginationLabels = {
  of: "von",
  previous: "Vorherige Seite",
  next: "Nächste Seite",
}

function DataTablePagination<TData>({
  table,
  labels,
}: {
  table: TanstackTable<TData>
  labels: DataTablePaginationLabels
}) {
  const total = table.getFilteredRowModel().rows.length
  if (total === 0) {
    return null
  }

  const { pageIndex, pageSize } = table.getState().pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min(from + pageSize - 1, total)

  const navButtonClassName =
    "size-10 rounded-full border border-border bg-card text-table-foreground shadow-xs hover:bg-card hover:text-foreground"

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-base text-table-foreground tabular-nums">
        <span className="text-primary">
          {from} - {to}
        </span>{" "}
        {labels.of} {total}
      </p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className={navButtonClassName}
          aria-label={labels.previous}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={navButtonClassName}
          aria-label={labels.next}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  cellClassName = "whitespace-nowrap text-sm text-table-foreground",
  pageSize,
  paginationLabels = DEFAULT_PAGINATION_LABELS,
}: {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Default style of all body cells; cells can still override it themselves. */
  cellClassName?: string
  /** Enables pagination with this many rows per page; without it all rows are shown. */
  pageSize?: number
  paginationLabels?: DataTablePaginationLabels
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(pageSize && {
      initialState: { pagination: { pageSize } },
      getPaginationRowModel: getPaginationRowModel(),
    }),
  })

  return (
    <>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={cellClassName}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Keine Ergebnisse.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pageSize ? (
        <DataTablePagination table={table} labels={paginationLabels} />
      ) : null}
    </>
  )
}
