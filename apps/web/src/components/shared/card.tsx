import { cn } from "@workspace/ui/lib/utils"

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-card", className)}
    >
      {children}
    </section>
  )
}
