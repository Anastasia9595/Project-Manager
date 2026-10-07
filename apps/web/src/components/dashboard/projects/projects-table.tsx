"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { Badge } from "@workspace/ui/components/badge"
import {
  DataTable,
  DataTableColumnHeader,
  type DataTablePaginationLabels,
} from "@workspace/ui/components/data-table"
import { Progress } from "@workspace/ui/components/progress"

import { formatShortDate, getDueInfo, type DueTone } from "@/lib/due-date"
import { DUMMY_PROJECTS } from "@/dummy-data/projects"
import type { Project, ProjectStatus } from "@/models/project"

const STATUS_LABEL: Record<ProjectStatus, string> = {
  created: "Erstellt",
  active: "Aktiv",
  paused: "Pausiert",
  completed: "Beendet",
}

const STATUS_CLASSNAME: Record<ProjectStatus, string> = {
  created: "bg-status-paused-tint text-status-paused",
  active: "bg-status-active-tint text-status-active",
  paused: "bg-status-paused-tint text-status-paused",
  completed: "bg-status-completed-tint text-status-completed",
}

const DUE_TONE_CLASSNAME: Record<DueTone, string> = {
  overdue: "text-destructive-dark",
  today: "text-warning-dark",
  upcoming: "text-success-dark",
}

function DueDateCell({ date }: { date: Date }) {
  const due = getDueInfo(date)
  return (
    <div className="flex flex-col">
      <span>{formatShortDate(date)}</span>
      <span className={`text-xs font-medium ${DUE_TONE_CLASSNAME[due.tone]}`}>{due.label}</span>
    </div>
  )
}

const baseColumns: ColumnDef<Project, unknown>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Projekt" />,
    cell: ({ row }) => (
      <span className="block max-w-60 truncate font-medium text-foreground">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge className={`h-6 px-3 font-semibold uppercase ${STATUS_CLASSNAME[status]}`}>
          {STATUS_LABEL[status]}
        </Badge>
      )
    },
  },
  {
    accessorKey: "palDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="PAL-Termin" />,
    cell: ({ row }) => <DueDateCell date={row.original.palDate} />,
  },
  {
    accessorKey: "dataHandoverDate",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Datenübergabe" />,
    cell: ({ row }) => <DueDateCell date={row.original.dataHandoverDate} />,
  },
  {
    accessorKey: "customer",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Kunde" />,
    cell: ({ row }) => row.original.customer,
  },
  {
    id: "progress",
    accessorFn: (row) => row.progress.done / row.progress.total,
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fortschritt" />,
    cell: ({ row }) => {
      const { done, total } = row.original.progress
      const percent = total === 0 ? 0 : (done / total) * 100
      return (
        <div className="flex items-center gap-3">
          <Progress value={percent} className="w-full" />
          <span className="text-sm tabular-nums">
            {done}/{total}
          </span>
        </div>
      )
    },
  },
]

const circulationColumn: ColumnDef<Project, unknown> = {
  accessorKey: "circulation",
  header: ({ column }) => <DataTableColumnHeader column={column} title="Auflage" />,
  cell: ({ row }) => (
    <span className="tabular-nums">{row.original.circulation.toLocaleString("de-DE")}</span>
  ),
}

// Modulweit statt pro Render gebaut, damit react-table stabile Spalten-Referenzen bekommt.
const CUSTOMER_COLUMN_INDEX = baseColumns.findIndex(
  (column) => "accessorKey" in column && column.accessorKey === "customer",
)
const columnsWithCirculation: ColumnDef<Project, unknown>[] = [
  ...baseColumns.slice(0, CUSTOMER_COLUMN_INDEX + 1),
  circulationColumn,
  ...baseColumns.slice(CUSTOMER_COLUMN_INDEX + 1),
]

export function ProjectsTable({
  projects = DUMMY_PROJECTS,
  title,
  showCirculation = false,
  pageSize,
  paginationLabels,
}: {
  projects?: Project[]
  title?: string
  showCirculation?: boolean
  pageSize?: number
  paginationLabels?: DataTablePaginationLabels
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      {title && <h2 className="mb-4 text-xl font-bold text-foreground">{title}</h2>}
      <DataTable
        columns={showCirculation ? columnsWithCirculation : baseColumns}
        data={projects}
        pageSize={pageSize}
        paginationLabels={paginationLabels}
      />
    </div>
  )
}
