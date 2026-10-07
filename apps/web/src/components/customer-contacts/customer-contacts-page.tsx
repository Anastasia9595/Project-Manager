import { useMemo, useState } from "react"

import { getDictionary } from "@/i18n"
import { CreateButton } from "@/components/shared/create-button"
import { PageHeader } from "@/components/shared/page-header"
import { SearchInput } from "@/components/shared/search-input"
import { CustomerContactsTable } from "../dashboard/customer-contacts/customer-contacts-table"
import { DUMMY_CUSTOMER_CONTACTS } from "@/dummy-data/customer-contacts"
import type { CustomerContact } from "@/models/customer-contact"

function matchesQuery(contact: CustomerContact, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return (
    contact.customer.toLowerCase().includes(needle) ||
    contact.contactPerson.toLowerCase().includes(needle) ||
    contact.website.toLowerCase().includes(needle) ||
    contact.email.toLowerCase().includes(needle)
  )
}

const PAGE_SIZE = 10

export function CustomerContactsPage({
  locale,
  customerContacts = DUMMY_CUSTOMER_CONTACTS,
}: {
  locale?: string
  customerContacts?: CustomerContact[]
}) {
  const dict = getDictionary(locale).customerContactsPage
  const [query, setQuery] = useState("")

  const filteredContacts = useMemo(
    () => customerContacts.filter((contact) => matchesQuery(contact, query)),
    [customerContacts, query]
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={dict.title}
        subtitle={dict.subtitle}
        actions={
          <>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={dict.searchPlaceholder}
            />
            <CreateButton label={dict.newCustomerContact} />
          </>
        }
      />
      <CustomerContactsTable
        contacts={filteredContacts}
        pageSize={PAGE_SIZE}
        paginationLabels={dict.pagination}
        locale={locale}
      />
    </div>
  )
}
