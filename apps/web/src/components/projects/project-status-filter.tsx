import { cn } from "@workspace/ui/lib/utils"

export type StatusFilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

export function ProjectStatusFilter<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: StatusFilterOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-3">
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-10 items-center gap-3 rounded-full border bg-card px-6 text-base transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              selected
                ? "border-primary bg-secondary font-semibold text-foreground"
                : "border-muted text-foreground hover:bg-secondary/60",
            )}
          >
            {option.label}
            <span
              className={cn(
                "rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
                selected ? "bg-primary/25 text-foreground" : "bg-muted/40 text-muted-foreground",
              )}
            >
              {option.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
