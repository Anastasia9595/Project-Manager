const LEGEND_ITEMS = [
  { label: "Soll-Stunden", swatchClassName: "bg-primary/35" },
  { label: "Ist-Stunden", swatchClassName: "bg-primary" },
]

export function WorkTimeLegend() {
  return (
    <ul className="flex items-center gap-4 text-sm text-muted-foreground">
      {LEGEND_ITEMS.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span aria-hidden className={`size-3 rounded-full ${item.swatchClassName}`} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
