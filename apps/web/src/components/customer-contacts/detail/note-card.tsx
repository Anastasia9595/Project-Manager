import { Card } from "@/components/shared/card"

export function NoteCard({
  note,
  title,
  emptyLabel,
}: {
  note?: string
  title: string
  emptyLabel: string
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{note ?? emptyLabel}</p>
    </Card>
  )
}
