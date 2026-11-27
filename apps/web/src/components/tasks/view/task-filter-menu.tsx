import { ArrowDown01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@workspace/ui/components/combobox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"

import type { FilterOption } from "@/lib/tracked-tasks"
import { fillTemplate } from "@/utils/fill-template"

/** Name einzeilig links, Anzahl als feste Spalte rechts. */
function OptionLabel({
  option,
  countLabel,
}: {
  option: FilterOption
  countLabel: string
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <span className="truncate" title={option.label}>
        {option.label}
      </span>
      <span className="shrink-0 text-muted-foreground tabular-nums">
        ({option.count})<span className="sr-only"> {countLabel}</span>
      </span>
    </span>
  )
}

/** Spaltenköpfe über der Liste; pr-8 hält die Spalte über den Zahlen (Platz für den Haken). */
function ListHeader({
  label,
  countLabel,
}: {
  label: string
  countLabel: string
}) {
  return (
    <div
      aria-hidden
      className="flex justify-between gap-4 pt-4 pr-8 pb-2 pl-3 text-sm font-semibold text-foreground"
    >
      <span>{label}</span>
      <span>{countLabel}</span>
    </div>
  )
}

/** Filter-Button mit Dropdown; optional mit Suche und Tags (Mehrfachauswahl). */
export function TaskFilterMenu({
  label,
  options,
  selected,
  onChange,
  searchable,
  texts,
}: {
  label: string
  options: FilterOption[]
  selected: string[]
  onChange: (values: string[]) => void
  searchable: boolean
  texts: { search: string; empty: string; remove: string; count: string }
}) {
  const chosen = options.filter((option) => selected.includes(option.value))

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" className="bg-card" />}>
        {label}
        {chosen.length > 0 && (
          <span className="text-muted-foreground tabular-nums">
            ({chosen.length})
          </span>
        )}
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-96 max-w-[calc(100vw-2rem)] gap-0 p-2"
      >
        {searchable ? (
          <Combobox
            inline
            open
            multiple
            items={options}
            value={chosen}
            onValueChange={(next: FilterOption[]) =>
              onChange(next.map((option) => option.value))
            }
            itemToStringLabel={(option: FilterOption) => option.label}
            isItemEqualToValue={(a: FilterOption, b: FilterOption) =>
              a.value === b.value
            }
          >
            <ComboboxChips>
              <ComboboxValue>
                {(value: FilterOption[]) => (
                  <>
                    {value.map((option) => (
                      <ComboboxChip
                        key={option.value}
                        aria-label={option.label}
                        className="max-w-full min-w-0"
                        removeLabel={fillTemplate(texts.remove, {
                          name: option.label,
                        })}
                      >
                        <span className="truncate">{option.label}</span>
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput
                      aria-label={label}
                      placeholder={value.length > 0 ? "" : texts.search}
                    />
                  </>
                )}
              </ComboboxValue>
            </ComboboxChips>
            {/* inline fehlt die Popup-Gruppe, die Empty sonst einblendet */}
            <ComboboxEmpty className="flex empty:hidden">
              {texts.empty}
            </ComboboxEmpty>
            <ListHeader label={label} countLabel={texts.count} />
            <ComboboxList>
              {(option: FilterOption) => (
                <ComboboxItem key={option.value} value={option}>
                  <OptionLabel option={option} countLabel={texts.count} />
                </ComboboxItem>
              )}
            </ComboboxList>
          </Combobox>
        ) : (
          <div role="group" aria-label={label} className="flex flex-col">
            <ListHeader label={label} countLabel={texts.count} />
            {options.map((option) => {
              const active = selected.includes(option.value)
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onChange(
                      active
                        ? selected.filter((value) => value !== option.value)
                        : [...selected, option.value]
                    )
                  }
                  className="relative flex w-full cursor-pointer items-center rounded-xl py-2 pr-8 pl-3 text-left text-sm transition-colors outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <OptionLabel option={option} countLabel={texts.count} />
                  {active && (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      className="absolute right-2 size-4"
                    />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
