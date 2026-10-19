import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import { InputGroupAddon } from "@workspace/ui/components/input-group"

import { formatProjectOption } from "@/lib/projects"
import type { Project } from "@/models/project"

/** Durchsuchbare Projektauswahl (Klarname und interne ID). */
export function ProjectCombobox({
  id,
  projects,
  value,
  onChange,
  invalid,
  describedBy,
  placeholder,
  emptyLabel,
  disabled,
}: {
  id: string
  projects: Project[]
  value: string | null
  onChange: (projectId: string | null) => void
  invalid: boolean
  describedBy?: string
  placeholder: string
  emptyLabel: string
  disabled?: boolean
}) {
  const selected = projects.find((project) => project.id === value) ?? null

  return (
    <Combobox
      items={projects}
      value={selected}
      onValueChange={(project: Project | null) => onChange(project?.id ?? null)}
      itemToStringLabel={formatProjectOption}
      isItemEqualToValue={(a: Project, b: Project) => a.id === b.id}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className="w-full"
        disabled={disabled}
      >
        <InputGroupAddon align="inline-start">
          <HugeiconsIcon icon={Search01Icon} strokeWidth={2} aria-hidden />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>{emptyLabel}</ComboboxEmpty>
        <ComboboxList>
          {(project: Project) => (
            <ComboboxItem key={project.id} value={project}>
              {formatProjectOption(project)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
