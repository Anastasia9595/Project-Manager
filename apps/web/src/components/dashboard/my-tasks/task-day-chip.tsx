import { formatDayLabel, formatWeekdayShort, isWeekend } from "@/lib/week"

type TaskDayChipProps = {
  date: Date
  isSelected: boolean
  isToday: boolean
  onSelect: (date: Date) => void
}

export function TaskDayChip({ date, isSelected, isToday, onSelect }: TaskDayChipProps) {
  const toneClassName = isSelected
    ? "bg-primary text-white"
    : isWeekend(date)
      ? "bg-secondary/60 text-muted-foreground/50"
      : "bg-secondary text-foreground"

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      aria-label={formatDayLabel(date)}
      onClick={() => onSelect(date)}
      className={`flex min-w-0 flex-1 flex-col items-center rounded-xl px-1 py-2 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 ${toneClassName}`}
    >
      <span className="text-xs font-medium opacity-80">{formatWeekdayShort(date)}</span>
      <span className="text-lg leading-tight font-bold">
        {String(date.getDate()).padStart(2, "0")}
      </span>
      <span
        aria-hidden
        className={`mt-0.5 size-1 rounded-full ${isToday ? "bg-current" : "bg-transparent"}`}
      />
    </button>
  )
}
