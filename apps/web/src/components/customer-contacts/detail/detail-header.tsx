import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import type { Dictionary } from "@/i18n"

type CustomerContactsTexts = Dictionary["customerContactsPage"]

export function DetailHeader({
  customer,
  overviewHref,
  texts,
}: {
  customer: string
  overviewHref: string
  texts: CustomerContactsTexts
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
   
      <nav aria-label={texts.detail.breadcrumbLabel}>
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li>
            <a href={overviewHref} className="hover:text-foreground">
              {texts.title}
            </a>
          </li>
          <li aria-hidden>
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
          </li>
          <li aria-current="page" className="font-medium text-foreground">
            {customer}
          </li>
        </ol>
      </nav>
    </div>
  )
}
