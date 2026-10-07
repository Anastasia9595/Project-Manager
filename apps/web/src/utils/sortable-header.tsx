import type { HeaderContext } from "@tanstack/react-table"

import { DataTableColumnHeader } from "@workspace/ui/components/data-table"

/** Spaltenkopf mit Sortier-Button, z.B. `header: sortableHeader("E-Mail")`. */
export function sortableHeader<TData>(title: string) {
  return function SortableHeader({ column }: HeaderContext<TData, unknown>) {
    return <DataTableColumnHeader column={column} title={title} />
  }
}
