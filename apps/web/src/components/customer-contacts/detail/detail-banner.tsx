import type { CustomerContact } from "@/models/customer-contact"
import { InitialsAvatar } from "@/components/shared/initials-avatar"

export function DetailBanner({
  contact,
  editLabel,
}: {
  contact: CustomerContact
  editLabel: string
}) {
  return (
    <div
      className="relative flex h-56 items-end justify-between gap-4 overflow-hidden rounded-2xl bg-cover bg-center p-6"
      style={{
        backgroundImage: contact.bannerUrl
          ? `url(${contact.bannerUrl})`
          : "linear-gradient(135deg, var(--primary), var(--accent))",
      }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      <div className="relative flex items-center gap-4">
        <InitialsAvatar
          name={contact.customer}
          logoUrl={contact.logoUrl}
          className="size-14 border-2 border-white"
          fallbackClassName="bg-primary text-sm text-white"
        />
        <h1 className="text-xl font-bold text-white">{contact.customer}</h1>
      </div>
      <button
        type="button"
        className="relative rounded-full bg-white px-4 py-2 text-xs font-medium text-foreground shadow-xs"
      >
        {editLabel}
      </button>
    </div>
  )
}
