import { useState } from "react"

/** Merkt sich zugeklappte Einträge per ID; anfangs ist alles aufgeklappt. */
export function useCollapsedIds() {
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())

  function isExpanded(id: string): boolean {
    return !collapsed.has(id)
  }

  function toggle(id: string) {
    setCollapsed((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })
  }

  return { isExpanded, toggle }
}
