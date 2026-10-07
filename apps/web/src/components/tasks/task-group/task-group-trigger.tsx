import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { CollapsibleTrigger } from "@workspace/ui/components/collapsible"

export function TaskGroupTrigger({
  title,
  count,
  open,
}: {
  title: string
  count: number
  open: boolean
}) {
  return (
    <CollapsibleTrigger className="flex w-fit items-center gap-2 rounded-md text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className={`size-4 text-foreground transition-transform ${open ? "" : "-rotate-90"}`}
      />
      <span className="text-lg font-semibold text-foreground">
        {title}{" "}
        <span className="font-normal text-muted-foreground tabular-nums">
          ({count})
        </span>
      </span>
    </CollapsibleTrigger>
  )
}
