export type CustomerContact = {
  id: string
  customer: string
  /** Optionales Kundenlogo; ohne Logo werden die Initialen angezeigt. */
  logoUrl?: string
  contactPerson: string
  website: string
  email: string
  phone: string
  address: string
  /** Branchen-/Fachverband, dem der Kunde angehört. */
  association: string
  /** Optionales Bannerbild der Detailseite; ohne Bild wird ein Verlauf angezeigt. */
  bannerUrl?: string
  /** Erstellungsdatum als ISO-String (z.B. "2026-01-02"). */
  createdAt?: string
  note?: string
  contacts?: CustomerContactPerson[]
  branches?: CustomerBranch[]
}

export type CustomerContactPerson = {
  id: string
  name: string
  position: string
  phone: string
  email: string
}

export type CustomerBranch = {
  id: string
  name: string
  address: string
  phone: string
  email: string
}
