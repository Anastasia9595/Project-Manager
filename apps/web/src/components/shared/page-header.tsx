/** Seitenkopf mit Titel/Untertitel links und Aktionen (z.B. Suche, Button) rechts. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  )
}
