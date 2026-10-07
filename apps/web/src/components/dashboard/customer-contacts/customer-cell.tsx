import { InitialsAvatar } from "@/components/shared/initials-avatar"
import type { CustomerContact } from "@/models/customer-contact"

/** Logo und Name des Kunden, optional als Link zur Detailseite. */
export function CustomerCell({
  contact,
  href,
}: {
  contact: CustomerContact
  href?: string
}) {
  const content = (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <InitialsAvatar
        name={contact.customer}
        logoUrl={contact.logoUrl}
        size="lg"
      />
      <span>{contact.customer}</span>
    </div>
  )

  if (!href) return content
  return (
    <a
      href={href}
      className="rounded-md hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {content}
    </a>
  )
}
