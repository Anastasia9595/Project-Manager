# Formular „Neuer Kundenkontakt“ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Button „Neuer Kundenkontakt“ auf `/company-profile` öffnet einen Dialog, der eine Kontaktperson in der Directus-Collection `tenant_users` anlegt.

**Architecture:** Reine Logik (Feldzuordnung, Validierung, Request-Handler) liegt in `apps/web/src/lib/customer-contact-form/` und ist per Vitest testbar. Zwei dünne Astro-API-Routen (`POST`/`GET`) rufen diese Logik hinter `withSession` auf. Die React-Komponente `CustomerContactForm` lädt die Dropdown-Optionen beim Öffnen und speichert über `useSaveRequest`.

**Tech Stack:** Astro 7 (SSR, API-Routen), React 19, `@directus/sdk` 25, Vitest 3, `@workspace/ui` (Dialog, Input, Textarea, Switch, Label), sonner (Toast).

**Spec:** `docs/superpowers/specs/2026-10-22-customer-contact-form-design.md`

## Global Constraints

- Ziel-Collection ist `tenant_users`; Status bleibt der Directus-Standard `draft` und wird nicht gesendet.
- Pflichtfelder: Vorname, Nachname, Kunde. E-Mail wird nur geprüft, wenn ausgefüllt.
- Positionswerte: `management`, `assistenz_von_fr_seifert`, `assistenz_empfang`, `buchhaltung`, `werbeabteilung`. Kontaktarten: `email`, `phone`, `mobile`.
- Tags und Status-Auswahl sind nicht Teil dieses Plans. Die Übersichtstabelle bleibt bei `DUMMY_CUSTOMER_CONTACTS`.
- Leere optionale Felder werden als `null` an Directus gesendet.
- Der Directus-Token bleibt serverseitig (`apps/web/src/lib/directus.ts`).
- UI-Texte kommen aus `i18n/de.ts` und `i18n/en.ts` unter `customerContactsPage.form`. Code-Kommentare sind deutsch, wie im restlichen Projekt.
- Alle Befehle laufen in `apps/web` (`cd apps/web`). Tests: `npm run test`, Typen: `npm run typecheck`.
- Vitest führt nur `src/**/*.test.ts` aus. Tests dürfen nicht unter `src/pages/` liegen (Astro würde sie als Routen behandeln).
- Der Ordner heißt `lib/customer-contact-form/`, weil `lib/customer-contacts.ts` (Links) schon existiert.

---

### Task 1: Feldzuordnung und Validierung

**Files:**
- Create: `apps/web/src/lib/customer-contact-form/fields.ts`
- Create: `apps/web/src/lib/customer-contact-form/validation.ts`
- Test: `apps/web/src/lib/customer-contact-form/fields.test.ts`
- Test: `apps/web/src/lib/customer-contact-form/validation.test.ts`

**Interfaces:**
- Produces (`fields.ts`):
  - `POSITIONS`, `CONTACT_METHODS` (readonly Tupel), Typen `Position`, `ContactMethod`
  - `type CustomerContactValues = { firstName: string; lastName: string; tenantId: string; locationId: string; position: "" | Position; isActive: boolean; email: string; phone: string; mobile: string; preferredContact: "" | ContactMethod; notes: string }`
  - `EMPTY_CUSTOMER_CONTACT_VALUES: CustomerContactValues` (alles leer, `isActive: true`)
  - `isCustomerContactValues(body: unknown): body is CustomerContactValues`
  - `toDirectusPayload(values: CustomerContactValues): Record<string, unknown>`
- Produces (`validation.ts`):
  - `type ContactValidationCode = "required" | "invalidEmail"`
  - `type ContactValidationErrors = Partial<Record<"firstName" | "lastName" | "tenantId" | "email", ContactValidationCode>>`
  - `validateCustomerContact(values: CustomerContactValues): ContactValidationErrors`

- [ ] **Step 1: Failing Tests schreiben**

`apps/web/src/lib/customer-contact-form/fields.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import {
  EMPTY_CUSTOMER_CONTACT_VALUES,
  isCustomerContactValues,
  toDirectusPayload,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"

const filled: CustomerContactValues = {
  firstName: "  Anna ",
  lastName: "Muster",
  tenantId: "tenant-1",
  locationId: "location-1",
  position: "buchhaltung",
  isActive: false,
  email: "anna@example.com",
  phone: "0561 123",
  mobile: "0170 456",
  preferredContact: "mobile",
  notes: "Nur vormittags",
}

describe("toDirectusPayload", () => {
  it("ordnet die Formularfelder den Directus-Feldern zu", () => {
    expect(toDirectusPayload(filled)).toEqual({
      first_name: "Anna",
      last_name: "Muster",
      tenant: "tenant-1",
      locations: "location-1",
      positions: "buchhaltung",
      is_active: false,
      email: "anna@example.com",
      phone: "0561 123",
      mobile: "0170 456",
      preferred_contact: "mobile",
      notes: "Nur vormittags",
    })
  })

  it("sendet leere optionale Felder als null", () => {
    const payload = toDirectusPayload({
      ...EMPTY_CUSTOMER_CONTACT_VALUES,
      firstName: "Anna",
      lastName: "Muster",
      tenantId: "tenant-1",
    })
    expect(payload).toEqual({
      first_name: "Anna",
      last_name: "Muster",
      tenant: "tenant-1",
      locations: null,
      positions: null,
      is_active: true,
      email: null,
      phone: null,
      mobile: null,
      preferred_contact: null,
      notes: null,
    })
  })
})

describe("isCustomerContactValues", () => {
  it("akzeptiert vollständige Werte", () => {
    expect(isCustomerContactValues(filled)).toBe(true)
    expect(isCustomerContactValues(EMPTY_CUSTOMER_CONTACT_VALUES)).toBe(true)
  })

  it("lehnt fehlende oder falsch typisierte Felder ab", () => {
    expect(isCustomerContactValues(null)).toBe(false)
    expect(isCustomerContactValues("text")).toBe(false)
    expect(isCustomerContactValues({ ...filled, firstName: 1 })).toBe(false)
    expect(isCustomerContactValues({ ...filled, isActive: "true" })).toBe(false)
    const { notes: _notes, ...withoutNotes } = filled
    expect(isCustomerContactValues(withoutNotes)).toBe(false)
  })

  it("lehnt unbekannte Positionen und Kontaktarten ab", () => {
    expect(isCustomerContactValues({ ...filled, position: "ceo" })).toBe(false)
    expect(isCustomerContactValues({ ...filled, preferredContact: "fax" })).toBe(
      false
    )
  })
})
```

`apps/web/src/lib/customer-contact-form/validation.test.ts`:

```ts
import { describe, expect, it } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"

const valid = {
  ...EMPTY_CUSTOMER_CONTACT_VALUES,
  firstName: "Anna",
  lastName: "Muster",
  tenantId: "tenant-1",
}

describe("validateCustomerContact", () => {
  it("meldet fehlende Pflichtfelder", () => {
    expect(validateCustomerContact(EMPTY_CUSTOMER_CONTACT_VALUES)).toEqual({
      firstName: "required",
      lastName: "required",
      tenantId: "required",
    })
  })

  it("behandelt Leerzeichen als leer", () => {
    expect(
      validateCustomerContact({ ...valid, firstName: "   " })
    ).toEqual({ firstName: "required" })
  })

  it("akzeptiert Werte ohne optionale Felder", () => {
    expect(validateCustomerContact(valid)).toEqual({})
  })

  it("prüft die E-Mail nur, wenn sie ausgefüllt ist", () => {
    expect(validateCustomerContact({ ...valid, email: "" })).toEqual({})
    expect(validateCustomerContact({ ...valid, email: "kein-mail" })).toEqual({
      email: "invalidEmail",
    })
    expect(
      validateCustomerContact({ ...valid, email: "anna@example.com" })
    ).toEqual({})
  })
})
```

- [ ] **Step 2: Tests laufen lassen, Fehlschlag prüfen**

Run: `cd apps/web && npx vitest run src/lib/customer-contact-form`
Expected: FAIL, Module `fields`/`validation` nicht gefunden.

- [ ] **Step 3: Implementierung schreiben**

`apps/web/src/lib/customer-contact-form/fields.ts`:

```ts
// Zuordnung des Formulars "Neuer Kundenkontakt" zur Directus-Collection tenant_users.

export const POSITIONS = [
  "management",
  "assistenz_von_fr_seifert",
  "assistenz_empfang",
  "buchhaltung",
  "werbeabteilung",
] as const

export const CONTACT_METHODS = ["email", "phone", "mobile"] as const

export type Position = (typeof POSITIONS)[number]
export type ContactMethod = (typeof CONTACT_METHODS)[number]

export type CustomerContactValues = {
  firstName: string
  lastName: string
  /** ID des Kunden (tenants). */
  tenantId: string
  /** ID des Standorts (location); leer, wenn keiner gewählt ist. */
  locationId: string
  position: "" | Position
  isActive: boolean
  email: string
  phone: string
  mobile: string
  preferredContact: "" | ContactMethod
  notes: string
}

export const EMPTY_CUSTOMER_CONTACT_VALUES: CustomerContactValues = {
  firstName: "",
  lastName: "",
  tenantId: "",
  locationId: "",
  position: "",
  isActive: true,
  email: "",
  phone: "",
  mobile: "",
  preferredContact: "",
  notes: "",
}

const STRING_KEYS = [
  "firstName",
  "lastName",
  "tenantId",
  "locationId",
  "position",
  "email",
  "phone",
  "mobile",
  "preferredContact",
  "notes",
] as const

function isOneOf(value: unknown, allowed: readonly string[]): boolean {
  return value === "" || (typeof value === "string" && allowed.includes(value))
}

export function isCustomerContactValues(
  body: unknown
): body is CustomerContactValues {
  if (typeof body !== "object" || body === null) return false
  const record = body as Record<string, unknown>
  return (
    STRING_KEYS.every((key) => typeof record[key] === "string") &&
    typeof record.isActive === "boolean" &&
    isOneOf(record.position, POSITIONS) &&
    isOneOf(record.preferredContact, CONTACT_METHODS)
  )
}

function orNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

export function toDirectusPayload(
  values: CustomerContactValues
): Record<string, unknown> {
  return {
    first_name: values.firstName.trim(),
    last_name: values.lastName.trim(),
    tenant: values.tenantId,
    locations: orNull(values.locationId),
    positions: values.position || null,
    is_active: values.isActive,
    email: orNull(values.email),
    phone: orNull(values.phone),
    mobile: orNull(values.mobile),
    preferred_contact: values.preferredContact || null,
    notes: orNull(values.notes),
  }
}
```

`apps/web/src/lib/customer-contact-form/validation.ts`:

```ts
import type { CustomerContactValues } from "@/lib/customer-contact-form/fields"
import { isValidEmail } from "@/utils/validators"

export type ContactValidationCode = "required" | "invalidEmail"

export type ContactValidationErrors = Partial<
  Record<"firstName" | "lastName" | "tenantId" | "email", ContactValidationCode>
>

/** Wird im Browser und in der API-Route genutzt. */
export function validateCustomerContact(
  values: CustomerContactValues
): ContactValidationErrors {
  const errors: ContactValidationErrors = {}

  if (!values.firstName.trim()) errors.firstName = "required"
  if (!values.lastName.trim()) errors.lastName = "required"
  if (!values.tenantId) errors.tenantId = "required"
  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "invalidEmail"
  }

  return errors
}
```

- [ ] **Step 4: Tests laufen lassen, Erfolg prüfen**

Run: `cd apps/web && npx vitest run src/lib/customer-contact-form`
Expected: PASS (alle Tests in beiden Dateien).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/customer-contact-form
git commit -m "feat: add customer contact form field mapping and validation"
```

---

### Task 2: Repository und API-Routen

**Files:**
- Create: `apps/web/src/lib/customer-contact-form/repository.ts`
- Create: `apps/web/src/lib/customer-contact-form/create-contact.ts`
- Create: `apps/web/src/pages/api/customer-contacts/index.ts`
- Create: `apps/web/src/pages/api/customer-contacts/options.ts`
- Test: `apps/web/src/lib/customer-contact-form/create-contact.test.ts`

**Interfaces:**
- Consumes (Task 1): `isCustomerContactValues`, `toDirectusPayload`, `CustomerContactValues` aus `fields.ts`; `validateCustomerContact` aus `validation.ts`.
- Produces (`repository.ts`):
  - `type ContactOptions = { tenants: { id: string; name: string }[]; locations: { id: string; name: string; tenant: string | null }[] }`
  - `createTenantUser(values: CustomerContactValues): Promise<void>`
  - `fetchContactOptions(): Promise<ContactOptions>`
- Produces (`create-contact.ts`): `handleCreateContact(request: Request): Promise<Response>` mit den Antworten `200 { ok: true }`, `400 { error: "invalid_body" }`, `400 { error: "invalid_fields", fields }`, `400 { error: "create_failed" }`.
- Produces (HTTP): `POST /api/customer-contacts` (Body = `CustomerContactValues`), `GET /api/customer-contacts/options` → `ContactOptions` bzw. `502 { error: "options_failed" }`.

- [ ] **Step 1: Failing Test schreiben**

`apps/web/src/lib/customer-contact-form/create-contact.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest"

import { EMPTY_CUSTOMER_CONTACT_VALUES } from "@/lib/customer-contact-form/fields"

const createTenantUser = vi.fn()
vi.mock("@/lib/customer-contact-form/repository", () => ({ createTenantUser }))

const { handleCreateContact } = await import(
  "@/lib/customer-contact-form/create-contact"
)

const valid = {
  ...EMPTY_CUSTOMER_CONTACT_VALUES,
  firstName: "Anna",
  lastName: "Muster",
  tenantId: "tenant-1",
}

function post(body: unknown): Request {
  return new Request("http://localhost/api/customer-contacts", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
  })
}

describe("handleCreateContact", () => {
  beforeEach(() => {
    createTenantUser.mockReset()
  })

  it("legt den Kontakt an und antwortet mit 200", async () => {
    createTenantUser.mockResolvedValue(undefined)
    const response = await handleCreateContact(post(valid))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ ok: true })
    expect(createTenantUser).toHaveBeenCalledWith(valid)
  })

  it("antwortet mit 400 bei ungültigem JSON oder Body", async () => {
    for (const body of ["kein json", { firstName: "Anna" }]) {
      const response = await handleCreateContact(post(body))
      expect(response.status).toBe(400)
      expect(await response.json()).toEqual({ error: "invalid_body" })
    }
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("antwortet mit 400 und den Feldfehlern", async () => {
    const response = await handleCreateContact(
      post({ ...valid, firstName: "", email: "kein-mail" })
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      error: "invalid_fields",
      fields: { firstName: "required", email: "invalidEmail" },
    })
    expect(createTenantUser).not.toHaveBeenCalled()
  })

  it("antwortet mit create_failed, wenn Directus den Eintrag ablehnt", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    createTenantUser.mockRejectedValue(
      Object.assign(new Error("rejected"), { errors: [{ message: "x" }] })
    )
    const response = await handleCreateContact(post(valid))
    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "create_failed" })
  })

  it("reicht unerwartete Fehler weiter", async () => {
    createTenantUser.mockRejectedValue(new Error("boom"))
    await expect(handleCreateContact(post(valid))).rejects.toThrow("boom")
  })
})
```

- [ ] **Step 2: Test laufen lassen, Fehlschlag prüfen**

Run: `cd apps/web && npx vitest run src/lib/customer-contact-form/create-contact.test.ts`
Expected: FAIL, Modul `create-contact` nicht gefunden.

- [ ] **Step 3: Implementierung schreiben**

`apps/web/src/lib/customer-contact-form/repository.ts`:

```ts
import { createItem, readItems } from "@directus/sdk"

import { directus } from "@/lib/directus"
import {
  toDirectusPayload,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"

export type ContactOptions = {
  tenants: { id: string; name: string }[]
  locations: { id: string; name: string; tenant: string | null }[]
}

type TenantRow = { id: string; tenant_name: string | null }
type LocationRow = { id: string; name: string | null; tenant: string | null }

/** Legt eine Kontaktperson in tenant_users an (Status bleibt der Directus-Standard "draft"). */
export async function createTenantUser(
  values: CustomerContactValues
): Promise<void> {
  await directus.request(createItem("tenant_users", toDirectusPayload(values)))
}

/** Kunden und Standorte für die Dropdowns des Formulars. */
export async function fetchContactOptions(): Promise<ContactOptions> {
  const [tenants, locations] = await Promise.all([
    directus.request(
      readItems("tenants", {
        fields: ["id", "tenant_name"],
        sort: ["tenant_name"],
        limit: -1,
      })
    ) as unknown as Promise<TenantRow[]>,
    directus.request(
      readItems("location", {
        fields: ["id", "name", "tenant"],
        sort: ["name"],
        limit: -1,
      })
    ) as unknown as Promise<LocationRow[]>,
  ])

  return {
    tenants: tenants.map((row) => ({
      id: row.id,
      name: row.tenant_name ?? "",
    })),
    locations: locations.map((row) => ({
      id: row.id,
      name: row.name ?? "",
      tenant: row.tenant,
    })),
  }
}
```

`apps/web/src/lib/customer-contact-form/create-contact.ts`:

```ts
import { isDirectusError } from "@directus/sdk"

import { isCustomerContactValues } from "@/lib/customer-contact-form/fields"
import { createTenantUser } from "@/lib/customer-contact-form/repository"
import { validateCustomerContact } from "@/lib/customer-contact-form/validation"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

/** Logik der Route POST /api/customer-contacts; die Session prüft die Route selbst. */
export async function handleCreateContact(request: Request): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isCustomerContactValues(body)) {
    return jsonResponse(400, { error: "invalid_body" })
  }

  const fields = validateCustomerContact(body)
  if (Object.keys(fields).length > 0) {
    return jsonResponse(400, { error: "invalid_fields", fields })
  }

  try {
    await createTenantUser(body)
    return jsonResponse(200, { ok: true })
  } catch (error) {
    if (isDirectusError(error)) {
      console.error("Directus customer contact create failed", error)
      return jsonResponse(400, { error: "create_failed" })
    }
    throw error
  }
}
```

`apps/web/src/pages/api/customer-contacts/index.ts`:

```ts
import { handleCreateContact } from "@/lib/customer-contact-form/create-contact"
import { withSession } from "@/lib/auth/with-session"

export const POST = withSession(({ request }) => handleCreateContact(request))
```

`apps/web/src/pages/api/customer-contacts/options.ts`:

```ts
import { withSession } from "@/lib/auth/with-session"
import { fetchContactOptions } from "@/lib/customer-contact-form/repository"
import { jsonResponse } from "@/utils/json-response"

export const GET = withSession(async () => {
  try {
    return jsonResponse(200, await fetchContactOptions())
  } catch (error) {
    console.error("Directus contact options failed", error)
    return jsonResponse(502, { error: "options_failed" })
  }
})
```

- [ ] **Step 4: Test und Typecheck laufen lassen**

Run: `cd apps/web && npx vitest run src/lib/customer-contact-form && npm run typecheck`
Expected: Tests PASS; Typecheck ohne neue Fehler. Falls `createItem("tenant_users", …)` oder `readItems("location", …)` wegen des untypisierten Directus-Clients einen Typfehler meldet, den Aufruf mit `as never` auf dem Collection-Namen oder dem Ergebnis casten, bis der Typecheck sauber ist.

- [ ] **Step 5: Live-Prüfung gegen Directus (Lesen)**

Run (Git Bash, ohne den Token auszugeben):
`cd apps/web && set -a && . ./.env && set +a && curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" "$DIRECTUS_URL/items/location?fields=id,name,tenant&limit=2"`
Expected: JSON mit `data`-Array (bestätigt, dass die selektierten Felder lesbar sind).

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/customer-contact-form apps/web/src/pages/api/customer-contacts
git commit -m "feat: add customer contact create and options API"
```

---

### Task 3: Dialog-Formular, Texte und Einbindung

**Files:**
- Create: `apps/web/src/components/customer-contacts/form-select.tsx`
- Create: `apps/web/src/components/customer-contacts/customer-contact-form.tsx`
- Modify: `apps/web/src/i18n/de.ts` (in `customerContactsPage`, nach `newCustomerContact`)
- Modify: `apps/web/src/i18n/en.ts` (in `customerContactsPage`, nach `newCustomerContact`)
- Modify: `apps/web/src/components/customer-contacts/customer-contacts-page.tsx`

**Interfaces:**
- Consumes (Task 1): `CustomerContactValues`, `EMPTY_CUSTOMER_CONTACT_VALUES`, `POSITIONS`, `CONTACT_METHODS`, `validateCustomerContact`, `ContactValidationCode`.
- Consumes (Task 2): `ContactOptions` (Typ), HTTP `GET /api/customer-contacts/options`, `POST /api/customer-contacts`.
- Consumes (bestehend): `FormField`, `FormGrid` (`components/settings/form-field.tsx`), `SettingsInput`, `useSaveRequest` (`hooks/use-save-request.ts`), `Dictionary` (`i18n`).
- Produces: `CustomerContactForm({ open, onClose, onCreated, t })` mit `t: Dictionary["customerContactsPage"]["form"]`; `FormSelect` (natives `<select>` im Stil der Einstellungsfelder).

- [ ] **Step 1: Übersetzungen ergänzen**

In `apps/web/src/i18n/de.ts` direkt nach der Zeile `newCustomerContact: "Neuer Kundenkontakt",` einfügen:

```ts
    form: {
      title: "Neuer Kundenkontakt",
      description: "Lege eine neue Kontaktperson für einen Kunden an.",
      personSection: "Person",
      contactSection: "Kontakt",
      firstName: "Vorname",
      lastName: "Nachname",
      tenant: "Kunde",
      location: "Standort",
      position: "Position",
      isActive: "Aktiv",
      email: "E-Mail-Adresse",
      phone: "Telefon",
      mobile: "Mobiltelefon",
      preferredContact: "Bevorzugter Kontakt",
      notes: "Notizen",
      noSelection: "Bitte auswählen",
      noLocation: "Kein Standort",
      positions: {
        management: "Geschäftsleitung",
        assistenz_von_fr_seifert: "Assistenz von Fr. Seifert",
        assistenz_empfang: "Assistenz/Empfang",
        buchhaltung: "Buchhaltung",
        werbeabteilung: "Werbeabteilung",
      },
      contactMethods: {
        email: "E-Mail",
        phone: "Telefon",
        mobile: "Mobiltelefon",
      },
      validation: {
        required: "Dieses Feld ist erforderlich.",
        invalidEmail: "Bitte gib eine gültige E-Mail-Adresse ein.",
      },
      loading: "Kunden und Standorte werden geladen …",
      optionsError: "Kunden und Standorte konnten nicht geladen werden.",
      retry: "Erneut versuchen",
      save: "Kontakt anlegen",
      cancel: "Abbrechen",
      close: "Schließen",
      saveError: "Speichern nicht möglich. Bitte versuche es später erneut.",
      created: "Kundenkontakt wurde angelegt.",
    },
```

In `apps/web/src/i18n/en.ts` an derselben Stelle (nach `newCustomerContact: "New Customer Contact",`) einfügen:

```ts
    form: {
      title: "New Customer Contact",
      description: "Add a new contact person for a customer.",
      personSection: "Person",
      contactSection: "Contact",
      firstName: "First name",
      lastName: "Last name",
      tenant: "Customer",
      location: "Location",
      position: "Position",
      isActive: "Active",
      email: "Email address",
      phone: "Phone",
      mobile: "Mobile phone",
      preferredContact: "Preferred contact",
      notes: "Notes",
      noSelection: "Please select",
      noLocation: "No location",
      positions: {
        management: "Management",
        assistenz_von_fr_seifert: "Assistant to Ms. Seifert",
        assistenz_empfang: "Assistant/Reception",
        buchhaltung: "Accounting",
        werbeabteilung: "Advertising department",
      },
      contactMethods: {
        email: "Email",
        phone: "Phone",
        mobile: "Mobile phone",
      },
      validation: {
        required: "This field is required.",
        invalidEmail: "Please enter a valid email address.",
      },
      loading: "Loading customers and locations …",
      optionsError: "Customers and locations could not be loaded.",
      retry: "Try again",
      save: "Create contact",
      cancel: "Cancel",
      close: "Close",
      saveError: "Could not save. Please try again later.",
      created: "Customer contact was created.",
    },
```

- [ ] **Step 2: Typecheck der Übersetzungen**

Run: `cd apps/web && npm run typecheck`
Expected: keine Fehler (en.ts `satisfies Dictionary` bestätigt, dass beide Sprachen dieselben Schlüssel haben).

- [ ] **Step 3: `FormSelect` anlegen**

`apps/web/src/components/customer-contacts/form-select.tsx`:

```tsx
import type * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

/** Natives Auswahlfeld im Stil der Einstellungs-Eingabefelder (SettingsInput). */
export function FormSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-12 w-full min-w-0 rounded-4xl border border-input bg-input/30 px-3 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 md:text-sm",
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 4: `CustomerContactForm` anlegen**

`apps/web/src/components/customer-contacts/customer-contact-form.tsx`:

```tsx
import { useEffect, useMemo, useState, type SubmitEvent } from "react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Switch } from "@workspace/ui/components/switch"
import { Textarea } from "@workspace/ui/components/textarea"

import { FormField, FormGrid } from "@/components/settings/form-field"
import { SettingsInput } from "@/components/settings/settings-input"
import { useSaveRequest } from "@/hooks/use-save-request"
import type { Dictionary } from "@/i18n"
import {
  CONTACT_METHODS,
  EMPTY_CUSTOMER_CONTACT_VALUES,
  POSITIONS,
  type CustomerContactValues,
} from "@/lib/customer-contact-form/fields"
import type { ContactOptions } from "@/lib/customer-contact-form/repository"
import {
  validateCustomerContact,
  type ContactValidationCode,
} from "@/lib/customer-contact-form/validation"
import { FormSelect } from "./form-select"

type Dict = Dictionary["customerContactsPage"]["form"]
type FieldErrors = Partial<Record<string, ContactValidationCode>>
type OptionsState =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; options: ContactOptions }

/** Dialog zum Anlegen einer Kontaktperson (Directus: tenant_users). */
export function CustomerContactForm({
  open,
  onClose,
  onCreated,
  t,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
  t: Dict
}) {
  const [values, setValues] = useState(EMPTY_CUSTOMER_CONTACT_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [optionsState, setOptionsState] = useState<OptionsState>({
    state: "loading",
  })
  const [optionsAttempt, setOptionsAttempt] = useState(0)
  const { status, send, setStatus } = useSaveRequest(
    "/api/customer-contacts",
    "POST"
  )

  // Beim Öffnen frisch starten und Kunden/Standorte laden.
  useEffect(() => {
    if (!open) return
    setValues(EMPTY_CUSTOMER_CONTACT_VALUES)
    setErrors({})
    setStatus({ state: "idle" })
    setOptionsState({ state: "loading" })

    const controller = new AbortController()
    fetch("/api/customer-contacts/options", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("options_failed")
        return response.json() as Promise<ContactOptions>
      })
      .then((options) => setOptionsState({ state: "ready", options }))
      .catch((error: unknown) => {
        if ((error as Error).name !== "AbortError") {
          setOptionsState({ state: "error" })
        }
      })
    return () => controller.abort()
  }, [open, optionsAttempt, setStatus])

  const options = optionsState.state === "ready" ? optionsState.options : null
  const locations = useMemo(
    () =>
      options?.locations.filter(
        (location) => location.tenant === values.tenantId
      ) ?? [],
    [options, values.tenantId]
  )

  function setField<K extends keyof CustomerContactValues>(
    key: K,
    value: CustomerContactValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  function bindText(key: "firstName" | "lastName" | "email" | "phone" | "mobile") {
    return {
      value: values[key],
      "aria-invalid": errors[key] ? true : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setField(key, event.target.value),
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationErrors = validateCustomerContact(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (await send(values)) onCreated()
  }

  const message = (key: string) => {
    const code = errors[key]
    return code ? t.validation[code] : undefined
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        closeLabel={t.close}
        className="max-h-[90vh] max-w-2xl overflow-y-auto text-left"
      >
        <DialogTitle>{t.title}</DialogTitle>
        <DialogDescription className="mt-2">{t.description}</DialogDescription>

        {optionsState.state === "loading" && (
          <p className="mt-6 text-sm text-muted-foreground">{t.loading}</p>
        )}

        {optionsState.state === "error" && (
          <div className="mt-6 flex items-center gap-4">
            <p role="alert" className="text-sm text-destructive">
              {t.optionsError}
            </p>
            <Button
              variant="outline"
              onClick={() => setOptionsAttempt((attempt) => attempt + 1)}
            >
              {t.retry}
            </Button>
          </div>
        )}

        {options && (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-6 flex flex-col gap-8"
          >
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-2 text-base font-semibold">
                {t.personSection}
              </legend>
              <FormGrid>
                <FormField
                  label={t.firstName}
                  required
                  error={message("firstName")}
                >
                  {(id) => <SettingsInput id={id} {...bindText("firstName")} />}
                </FormField>
                <FormField
                  label={t.lastName}
                  required
                  error={message("lastName")}
                >
                  {(id) => <SettingsInput id={id} {...bindText("lastName")} />}
                </FormField>
                <FormField label={t.tenant} required error={message("tenantId")}>
                  {(id) => (
                    <FormSelect
                      id={id}
                      value={values.tenantId}
                      aria-invalid={errors.tenantId ? true : undefined}
                      onChange={(event) => {
                        setField("tenantId", event.target.value)
                        setField("locationId", "")
                      }}
                    >
                      <option value="">{t.noSelection}</option>
                      {options.tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </option>
                      ))}
                    </FormSelect>
                  )}
                </FormField>
                <FormField label={t.location}>
                  {(id) => (
                    <FormSelect
                      id={id}
                      value={values.locationId}
                      disabled={!values.tenantId}
                      onChange={(event) =>
                        setField("locationId", event.target.value)
                      }
                    >
                      <option value="">{t.noLocation}</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name}
                        </option>
                      ))}
                    </FormSelect>
                  )}
                </FormField>
                <FormField label={t.position}>
                  {(id) => (
                    <FormSelect
                      id={id}
                      value={values.position}
                      onChange={(event) =>
                        setField(
                          "position",
                          event.target.value as CustomerContactValues["position"]
                        )
                      }
                    >
                      <option value="">{t.noSelection}</option>
                      {POSITIONS.map((position) => (
                        <option key={position} value={position}>
                          {t.positions[position]}
                        </option>
                      ))}
                    </FormSelect>
                  )}
                </FormField>
                <FormField label={t.isActive}>
                  {(id) => (
                    <Switch
                      id={id}
                      checked={values.isActive}
                      onCheckedChange={(checked) =>
                        setField("isActive", checked)
                      }
                    />
                  )}
                </FormField>
              </FormGrid>
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="mb-2 text-base font-semibold">
                {t.contactSection}
              </legend>
              <FormGrid>
                <FormField label={t.email} error={message("email")}>
                  {(id) => (
                    <SettingsInput id={id} type="email" {...bindText("email")} />
                  )}
                </FormField>
                <FormField label={t.phone}>
                  {(id) => (
                    <SettingsInput id={id} type="tel" {...bindText("phone")} />
                  )}
                </FormField>
                <FormField label={t.mobile}>
                  {(id) => (
                    <SettingsInput id={id} type="tel" {...bindText("mobile")} />
                  )}
                </FormField>
                <FormField label={t.preferredContact}>
                  {(id) => (
                    <FormSelect
                      id={id}
                      value={values.preferredContact}
                      onChange={(event) =>
                        setField(
                          "preferredContact",
                          event.target
                            .value as CustomerContactValues["preferredContact"]
                        )
                      }
                    >
                      <option value="">{t.noSelection}</option>
                      {CONTACT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {t.contactMethods[method]}
                        </option>
                      ))}
                    </FormSelect>
                  )}
                </FormField>
                <FormField label={t.notes} className="sm:col-span-2">
                  {(id) => (
                    <Textarea
                      id={id}
                      rows={4}
                      value={values.notes}
                      onChange={(event) => setField("notes", event.target.value)}
                    />
                  )}
                </FormField>
              </FormGrid>
            </fieldset>

            <div className="flex items-center justify-end gap-3">
              {status.state === "error" && (
                <p role="alert" className="mr-auto text-sm text-destructive">
                  {t.saveError}
                </p>
              )}
              <DialogClose render={<Button type="button" variant="outline" />}>
                {t.cancel}
              </DialogClose>
              <Button
                type="submit"
                size="lg"
                disabled={status.state === "saving"}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {t.save}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 5: In die Seite einbinden**

In `apps/web/src/components/customer-contacts/customer-contacts-page.tsx`:

Imports ergänzen (zu den bestehenden Imports):

```tsx
import { toast } from "sonner"

import { Toaster } from "@workspace/ui/components/sonner"
import { CustomerContactForm } from "./customer-contact-form"
```

Im Komponenten-Body nach `const [query, setQuery] = useState("")` ergänzen:

```tsx
  const [formOpen, setFormOpen] = useState(false)
```

Den Button ersetzen:

```tsx
            <CreateButton
              label={dict.newCustomerContact}
              onClick={() => setFormOpen(true)}
            />
```

Direkt nach `<CustomerContactsTable … />` (innerhalb des äußeren `div`) einfügen:

```tsx
      <CustomerContactForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={() => {
          setFormOpen(false)
          toast.success(dict.form.created)
        }}
        t={dict.form}
      />
      <Toaster position="bottom-right" />
```

- [ ] **Step 6: Typecheck, Lint, Tests**

Run: `cd apps/web && npm run typecheck && npm run lint && npm run test`
Expected: alles grün. Typfehler zuerst beheben (z. B. fehlende Importe), nicht mit `any` umgehen.

- [ ] **Step 7: Manuelle Prüfung im Browser**

Run: `cd apps/web && npm run dev`, dann `/company-profile` öffnen (angemeldet).
Prüfen:
1. Klick auf „Neuer Kundenkontakt“ öffnet den Dialog; Kunden-Dropdown ist gefüllt.
2. Speichern ohne Eingaben zeigt „Dieses Feld ist erforderlich.“ bei Vorname, Nachname, Kunde.
3. Ungültige E-Mail zeigt die E-Mail-Fehlermeldung.
4. Standort-Dropdown ist ohne Kunde deaktiviert und zeigt nach Kundenwahl nur Standorte dieses Kunden. Hinweis: Hat ein Standort in Directus keinen Kunden (`tenant = null`), erscheint er nicht.
5. Gültiges Formular speichern: Dialog schließt, Toast „Kundenkontakt wurde angelegt.“, in Directus existiert ein neuer `tenant_users`-Eintrag mit Status `draft` (diesen Testeintrag danach in Directus löschen).
6. Dialog erneut öffnen: Formular ist leer.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/customer-contacts apps/web/src/i18n
git commit -m "feat: add new customer contact dialog form"
```
