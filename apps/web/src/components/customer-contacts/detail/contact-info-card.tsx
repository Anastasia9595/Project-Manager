import {
  Calendar03Icon,
  Call02Icon,
  Globe02Icon,
  Location01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons"

import type { CustomerContact } from "@/models/customer-contact"
import { formatDate } from "@/utils/format-date"
import { Card } from "@/components/shared/card"
import { InfoRow } from "./info-row"

export function ContactInfoCard({
  contact,
  locale,
}: {
  contact: CustomerContact
  locale?: string
}) {
  return (
    <Card className="p-6">
      <ul className="flex flex-col gap-4">
        <InfoRow icon={Mail01Icon}>{contact.email}</InfoRow>
        <InfoRow icon={Call02Icon}>{contact.phone}</InfoRow>
        <InfoRow icon={Globe02Icon}>{contact.website}</InfoRow>
        <InfoRow icon={Location01Icon}>{contact.address}</InfoRow>
        {contact.createdAt ? (
          <InfoRow icon={Calendar03Icon}>
            {formatDate(contact.createdAt, locale)}
          </InfoRow>
        ) : null}
      </ul>
    </Card>
  )
}
