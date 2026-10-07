import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@workspace/ui/components/button"

/** Oranger "Neu anlegen"-Button aus den Seitenköpfen der Listen-Seiten. */
export function CreateButton({
  label,
  onClick,
}: {
  label: string
  onClick?: () => void
}) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      className="shrink-0 bg-primary text-white hover:bg-primary/90"
    >
      <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
      {label}
    </Button>
  )
}
