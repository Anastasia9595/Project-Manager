import { createDummyContactPersons } from "@/dummy-data/customer-contact-persons"
import type { CustomerContact } from "@/models/customer-contact"

// TODO: durch Directus-Daten ersetzen (z.B. per `readItems("customer_contacts", ...)`).
// Die Spalten in `customer-contacts-table.tsx` erwarten nur die Felder aus dem
// `CustomerContact`-Typ - solange die Directus-Response darauf gemappt wird,
// bleibt der Rest der Tabelle unverändert.
const CUSTOMER_CONTACTS: CustomerContact[] = [
  {
    id: "1",
    customer: "Seidel Wohnwelt",
    contactPerson: "Claudia Wenig",
    website: "seidel-wohnwelt.de",
    email: "wenig@seidel-wohnwelt.de",
    phone: "0374 483000",
    address: "Görlitzschtalblick 4, 08209 Auerbach",
    association: "VME",
  },
  {
    id: "2",
    customer: "Weser Wohnwelt",
    contactPerson: "Michael Fischer",
    website: "weser-wohnwelt.de",
    email: "fischer@weser-wohnwelt.de",
    phone: "0421 5550100",
    address: "Weserstraße 18, 28199 Bremen",
    association: "VME",
    createdAt: "2026-01-02",
    note: "Langjähriger Kunde und Mitglied im VME. Bevorzugt den Kontakt per E-Mail, Rückfragen zu Angeboten bitte direkt an Herrn Fischer richten.",
    branches: [
      {
        id: "2-b1",
        name: "Bremen",
        address: "Findorffstraße 12, 28215 Bremen",
        phone: "+49 421 5550100",
        email: "bremen@weser-wohnwelt.de",
      },
      {
        id: "2-b2",
        name: "Oldenburg",
        address: "Industriestraße 28, 26121 Oldenburg",
        phone: "+49 441 5550200",
        email: "oldenburg@weser-wohnwelt.de",
      },
    ],
  },
  {
    id: "3",
    customer: "Knappstein",
    contactPerson: "Michael Knappstein",
    website: "knappstein.de",
    email: "knappstein@knappstein.de",
    phone: "02922 5550200",
    address: "Möbelring 7, 59457 Werl",
    association: "VME",
  },
  {
    id: "4",
    customer: "Wassermann",
    contactPerson: "Chantal Semmelroth",
    website: "wassermann.de",
    email: "semmelroth@wassermann.de",
    phone: "0511 5550300",
    address: "Leinweg 24, 30179 Hannover",
    association: "VME",
  },
  {
    id: "5",
    customer: "Wallach Möbelhaus",
    contactPerson: "Nadja Rautenberg",
    website: "wallach-moebelhaus.de",
    email: "rautenberg@wallach-moebelhaus.de",
    phone: "0531 5550400",
    address: "Einrichtungsstraße 12, 38112 Braunschweig",
    association: "VME",
  },
  {
    id: "6",
    customer: "Wohn Schick",
    contactPerson: "Peter Schick",
    website: "wohn-schick.de",
    email: "schick@wohn-schick.de",
    phone: "0711 5550500",
    address: "Wohnpark 9, 70469 Stuttgart",
    association: "VME",
  },
  {
    id: "7",
    customer: "Humati",
    contactPerson: "Marthe Landwehrs",
    website: "humati.de",
    email: "landwehrs@humati.de",
    phone: "040 5550600",
    address: "Hafenallee 31, 22767 Hamburg",
    association: "VME",
  },
]

export const DUMMY_CUSTOMER_CONTACTS: CustomerContact[] = CUSTOMER_CONTACTS.map(
  (contact) => ({
    ...contact,
    contacts:
      contact.contacts ??
      createDummyContactPersons(contact.id, contact.website),
  })
)
