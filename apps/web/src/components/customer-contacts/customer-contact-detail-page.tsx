import { getDictionary } from "@/i18n"
import { getCustomerContactsHref } from "@/lib/customer-contacts"
import type { CustomerContact } from "@/models/customer-contact"
import { BranchesCard } from "./detail/branches-card"
import { ContactInfoCard } from "./detail/contact-info-card"
import { DetailBanner } from "./detail/detail-banner"
import { DetailHeader } from "./detail/detail-header"
import { NoteCard } from "./detail/note-card"
import { PersonsCard } from "./detail/persons-card"

export function CustomerContactDetailPage({
  contact,
  locale,
}: {
  contact: CustomerContact
  locale?: string
}) {
  const t = getDictionary(locale).customerContactsPage
  const branches = contact.branches ?? []

  return (
    <div className="flex flex-col gap-6">
      <DetailHeader
        customer={contact.customer}
        overviewHref={getCustomerContactsHref(locale)}
        texts={t}
      />
      <DetailBanner contact={contact} editLabel={t.detail.editProfile} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <ContactInfoCard contact={contact} locale={locale} />
          {branches.length ? (
            <BranchesCard
              branches={branches}
              title={t.detail.branches}
              subtitle={t.detail.branchesSubtitle}
            />
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <PersonsCard
            persons={contact.contacts ?? []}
            title={t.detail.contactPersons}
            emptyLabel={t.detail.noContactPersons}
            columnLabels={t.detail.columns}
          />
          <NoteCard
            note={contact.note}
            title={t.detail.note}
            emptyLabel={t.detail.noNote}
          />
        </div>
      </div>
    </div>
  )
}
