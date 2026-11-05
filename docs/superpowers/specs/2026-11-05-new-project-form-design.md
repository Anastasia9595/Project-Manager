# Formular „Neues Projekt" (printing_lines anlegen) – Design

## Ziel
Der Button „Neues Projekt" auf `/projects` öffnet einen Dialog (Design und Verhalten wie „Neuer Kundenkontakt").
Beim Speichern entsteht in Directus eine `printing_lines`-Zeile samt der dafür nötigen `form_submissions`-Zeile.
Aufbauend auf `docs/superpowers/specs/2026-11-05-directus-read-data-design.md` (Service-Schicht).

## Befunde aus dem Directus-Schema
- `printing_lines.form_submission` ist NOT NULL → jede Druckstrecke braucht eine Einreichung.
- `form_submissions` verlangt `pal_date` (Validierung `>= $NOW`), `circulation`, `selected_variant`,
  `assigned_printer`, `assigned_contact`.
- `printing_lines` verlangt `name`, `tenant`, `media_type`, `assigned_contact`, `pal_date`. Der Standardstatus `draft`
  steht nicht in der Statusliste → immer `status = "created"` senden.
- Rolle „Orange Mitarbeiter" darf `printing_lines` und `form_submissions` anlegen/löschen und `tenants`, `tenant_users`,
  `media_types`, `media_variants`, `media_categories`, `printing_companies` lesen, aber **keine** `directus_users`
  auflisten → `assigned_contact` ist immer die angemeldete Person (`session.user.id`).
- Directus-Flows (Standardaufgaben, Nummernvergabe) sind inaktiv: Es entstehen keine Aufgaben automatisch.
- Primärschlüssel: `tenants`, `media_types`, `media_variants`, `form_submissions` = UUID; `printing_companies`,
  `tenant_users` = Integer.

## Formular
Pflicht: Projektname, Kunde, Medientyp, Variante (gefiltert nach Medientyp), Druckerei, Auflage, PAL-Datum (heute oder später).
Optional: Kontaktperson des Kunden (gefiltert nach Kunde), Pufferzeit (Tage), Lieferart (`pal`/`delivery`),
Lieferdatum, Verteildatum, gültig bis, Beschreibung, interne Notizen.
Projektnummer: kein Feld, der Server vergibt `P-<Jahr des PAL-Datums>-NNN` (höchste vorhandene Nummer dieses Jahres + 1).

## Speichern (`POST /api/projects`)
1. Body prüfen (Typ, UUIDs/Ganzzahlen), dann Feldvalidierung (gleiche Funktion wie im Browser) → `400 invalid_body` / `400 invalid_fields`.
2. Variante muss zum Medientyp gehören, Kontaktperson zum Kunden → sonst `400 invalid_variant` / `400 invalid_contact`.
3. `form_submissions` anlegen: `status approved`, `customer_company` = Kundenname, `submitted_by` = Kontaktperson,
   `selected_medium`, `selected_variant`, `medium_category` (= `media_types.category`), `circulation`, `assigned_printer`,
   `assigned_contact` = ich, `layout_choice orange_individual`, `pal_date` = max(PAL-Datum, morgen) (Directus-Validierung `>= $NOW`).
4. `printing_lines` anlegen: Formularwerte, `status created`, `project_number`, `category`, `assigned_contact` = ich,
   `form_submission` = Id aus Schritt 3, `pal_date` = echtes Datum.
5. Schlägt Schritt 4 fehl, wird die Einreichung aus Schritt 3 gelöscht (Best-Effort, Fehler beim Aufräumen wird geloggt).
6. Antwort `201 { id, name }`. Directus-Fehler laufen über `toErrorResponse` (401/403/400/502).

`GET /api/projects/options` liefert die Dropdown-Daten: Kunden, Kontaktpersonen (mit `tenant`), Medientypen,
Varianten (mit `mediaType`), Druckereien. Nur Admin/Agentur (`canViewInternalWork`), sonst `403`.

## Struktur
```
src/services/projects/
  new-project.values.ts        NewProjectValues, EMPTY_NEW_PROJECT_VALUES, isNewProjectValues (Typ-Guard)
  new-project.validation.ts    validateNewProject(values, today), MAX_LENGTH, Fehlercodes   (+ Test)
  new-project.mapper.ts        toSubmissionPayload, toPrintingLinePayload, nextProjectNumber   (+ Test)
  new-project.repository.ts    fetchProjectOptions, createProject (mit Aufräumen)
  new-project.handlers.ts      handleCreateProject, handleProjectOptions (Repository injiziert)   (+ Test)
  projects.client.ts           Browser: submitNewProject, loadProjectOptions
src/pages/api/projects/index.ts (POST), options.ts (GET)
src/hooks/use-project-options.ts, use-new-project-form.ts
src/components/projects/new-project/  new-project-form.tsx, Feldgruppen
src/i18n/de.ts, en.ts            projectsPage.form
```
Mapper reine Funktionen; die Handler bekommen die Repository-Funktionen als Parameter (testbar ohne Directus).

## Anbindung
`projects.astro` übergibt `canCreate = canViewInternalWork(role)`. `ProjectsPage` zeigt den Button nur dann und öffnet den Dialog.
Nach dem Speichern: Dialog schließt, Toast „Projekt „…" wurde angelegt", `window.location.reload()` lädt die Liste neu
(die Seite lädt serverseitig; ein Reload ist der kleinste Weg, die neuen Daten zu zeigen).

## Tests
Vitest: Validierung (Pflicht, Länge, Datum in der Vergangenheit, Pufferzeit, Zahlen), Mapper (Payloads, Nummernvergabe,
Clamp auf morgen), Handler (400/403/Erfolg/Aufräumen bei Fehlschlag). `npm test`, `npx astro check` (0 Fehler), `npx eslint src`.
Live mit dem Agentur-Login: Projekt anlegen, in Directus prüfen (Submission + Line verknüpft, Nummer, Status), Fehlerfall, danach Testdaten löschen (nach Freigabe).

## Nicht enthalten
Standardaufgaben für das neue Projekt, Bearbeiten/Löschen von Projekten, Kunden-Rolle, Datei-Uploads, Datumsauswahl-Widget (natives `type="date"`).

## Bekannte Grenze
Die Projektnummer wird ohne Sperre vergeben; zwei gleichzeitige Anlagen können dieselbe Nummer bekommen (`shortcut`, bei Bedarf Directus-Unique-Constraint).
