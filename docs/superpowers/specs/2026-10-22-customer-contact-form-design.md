# Formular „Neuer Kundenkontakt“ – Design

## Ziel

Der Button „Neuer Kundenkontakt“ auf `/company-profile` öffnet einen Dialog. Das Formular legt eine Kontaktperson in der Directus-Collection `tenant_users` an. Die Felder entsprechen den Feldern dieser Collection.

## Umfang

- Enthalten: Dialog mit Formular, Speichern per API-Endpunkt, Optionen für die Dropdowns, Validierung, Übersetzungen (de/en), Tests.
- Nicht enthalten: Tags (`tenant_tags`), Status-Auswahl (Status bleibt der Directus-Standard `draft`), Umstellung der Übersichtstabelle auf Directus. Die Tabelle nutzt weiter `DUMMY_CUSTOMER_CONTACTS`.

## Felder (Collection `tenant_users`)

| Formularfeld | Directus-Feld | Typ / Regel |
|---|---|---|
| Vorname | `first_name` | Text, Pflicht |
| Nachname | `last_name` | Text, Pflicht |
| Kunde | `tenant` | Dropdown aus `tenants` (Anzeige `tenant_name`), Pflicht |
| Standort | `locations` | Dropdown aus `location`, gefiltert nach gewähltem Kunden, optional |
| Position | `positions` | Dropdown: management, assistenz_von_fr_seifert, assistenz_empfang, buchhaltung, werbeabteilung; optional |
| Aktiv | `is_active` | Schalter, Standard an |
| E-Mail | `email` | Text, optional, Formatprüfung falls ausgefüllt |
| Telefon | `phone` | Text, optional |
| Mobil | `mobile` | Text, optional |
| Bevorzugter Kontakt | `preferred_contact` | Dropdown: email, phone, mobile; optional |
| Notizen | `notes` | Mehrzeiliger Text, optional |

Im Dialog sind die Felder in zwei Gruppen angeordnet, wie in Directus: „Person“ (Vorname, Nachname, Kunde, Standort, Position, Aktiv) und „Kontakt“ (E-Mail, Telefon, Mobil, Bevorzugter Kontakt, Notizen).

## Architektur

- `CustomerContactForm` (Komponente im Ordner `components/customer-contacts/`): Dialog, Formularzustand, Fehleranzeige. Eingebunden in `customer-contacts-page.tsx` über den bestehenden `CreateButton`.
- `lib/customer-contacts/fields.ts`: Feldzuordnung Formular → Directus an einer Stelle, Typguard für den Request-Body (Muster wie `profile-fields.ts`).
- `lib/customer-contacts/validation.ts`: reine Validierungsfunktion, liefert `fields` mit Fehlern pro Feld.
- `lib/customer-contacts/repository.ts`: `createTenantUser` (`createItem("tenant_users", …)`) und `fetchContactOptions` (Kunden und Standorte), beide mit dem statischen Server-Token aus `lib/directus.ts`. Der Token bleibt serverseitig.
- `pages/api/customer-contacts/index.ts` (`POST`): `withSession`, Body prüfen, validieren, anlegen. Antworten wie beim Profil: `400 { error: "invalid_body" }`, `400 { error: "invalid_fields", fields }`, `400 { error: "create_failed" }` bei Directus-Fehlern, `200 { ok: true }`.
- `pages/api/customer-contacts/options.ts` (`GET`): liefert `{ tenants: [{id, name}], locations: [{id, name, tenant}] }`.
- Übersetzungen in `i18n/de.ts` und `i18n/en.ts` (Dialogtitel, Feldlabels, Positions- und Kontaktart-Labels, Fehlermeldungen, Erfolgsmeldung).

## Ablauf

1. Klick auf „Neuer Kundenkontakt“ öffnet den Dialog und lädt die Optionen über `GET /api/customer-contacts/options`.
2. Die Standorte werden im Browser nach dem gewählten Kunden gefiltert. Bei Kundenwechsel wird der gewählte Standort zurückgesetzt.
3. Beim Speichern validiert der Client vorab, der Server validiert erneut.
4. Erfolg: Dialog schließt, Toast bestätigt das Anlegen.
5. Fehler: Der Dialog bleibt mit den Eingaben offen. Feldfehler stehen am Feld, ein Serverfehler als allgemeine Meldung. Schlägt das Laden der Optionen fehl, zeigt der Dialog eine Fehlermeldung mit „Erneut versuchen“ und das Speichern ist deaktiviert.

## Tests (Vitest)

- Validierung: Pflichtfelder, E-Mail-Format, leere optionale Felder.
- Feld-Mapping: Formularwerte → Directus-Payload, leere Strings werden als `null` gesendet.
- Endpunkt mit gemocktem Directus: 400 bei ungültigem Body, 400 bei Feldfehlern, 200 bei Erfolg, 400 `create_failed` bei Directus-Fehler.
