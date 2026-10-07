import { localizedPath } from "@/utils/localized-path"

const CUSTOMER_CONTACTS_PATH = "/company-profile"

/** Übersichtsseite der Kundenkontakte, z.B. "/company-profile" bzw. "/en/company-profile". */
export function getCustomerContactsHref(locale?: string): string {
  return localizedPath(CUSTOMER_CONTACTS_PATH, locale)
}

/** Detailseite eines Kundenkontakts, z.B. "/company-profile/2". */
export function getCustomerContactHref(id: string, locale?: string): string {
  return `${getCustomerContactsHref(locale)}/${id}`
}
