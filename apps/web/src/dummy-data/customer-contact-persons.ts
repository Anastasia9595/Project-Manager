import type { CustomerContactPerson } from "@/models/customer-contact"

const DUMMY_PERSONS = [
  {
    name: "Michael Fischer",
    position: "Geschäftsführer",
    phone: "0374 483000",
    mail: "fischer",
  },
  {
    name: "Michael Knappstein",
    position: "Marketingleitung",
    phone: "0421 5550100",
    mail: "knappstein",
  },
  {
    name: "Chantal Semmelroth",
    position: "Einkauf",
    phone: "02922 5550200",
    mail: "semmelroth",
  },
  {
    name: "Nadja Rautenberg",
    position: "Vertrieb",
    phone: "0531 5550400",
    mail: "rautenberg",
  },
  {
    name: "Thomas Wallach",
    position: "Filialleitung",
    phone: "035753 555070",
    mail: "wallach",
  },
  {
    name: "Sabine Krüger",
    position: "Buchhaltung",
    phone: "0531 5550410",
    mail: "krueger",
  },
  {
    name: "Jens Lohmann",
    position: "Kundenservice",
    phone: "0531 5550420",
    mail: "lohmann",
  },
  {
    name: "Anja Brandt",
    position: "Assistenz",
    phone: "0531 5550430",
    mail: "brandt",
  },
]

// TODO: durch Directus-Daten ersetzen (Ansprechpartner des jeweiligen Kunden).
/** Dummy-Ansprechpartner; die E-Mail-Adressen erhalten die Domain des Kunden. */
export function createDummyContactPersons(
  customerId: string,
  website: string
): CustomerContactPerson[] {
  return DUMMY_PERSONS.map(({ mail, ...person }, index) => ({
    id: `${customerId}-${index + 1}`,
    ...person,
    email: `${mail}@${website}`,
  }))
}
