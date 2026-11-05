# Frontend liest echte Daten aus Directus (Teil 1: Lesen) – Design

## Ziel

Dashboard, Projekte, Aufgaben und Kalender zeigen Daten aus Directus statt der statischen
Dummy-Daten. Der Datenzugriff liegt in einer eigenen Service-Schicht (`src/services/`), getrennt
nach Verbindung, Laden (Repository) und Übersetzen (Mapper). Komponenten kennen Directus nicht.

Teil 2 (Abhaken in Directus speichern) und Teil 3 (Zeiterfassung und Timer über `time_entries`)
folgen mit eigenem Spec.

## Entscheidungen

- **Neuer Ordner `src/services/`.** Die Kundenkontakt-Anbindung (`lib/customer-contacts-repository.ts`)
  zieht ohne Verhaltensänderung mit um, damit es nur ein Muster gibt.
- **Zugriff mit dem Token der angemeldeten Person** (`createUserClient`), damit ihre Directus-Rolle gilt.
  Das ungenutzte `lib/directus.ts` (statischer Token) entfällt.
- **Laden serverseitig in den Astro-Seiten**, Übergabe als Props an die React-Komponenten – wie heute
  bei den Kundenkontakten.
- **Status:** `invoiced` zählt als abgeschlossen; `cancelled` wird im Frontend nirgends angezeigt
  (weder die Druckstrecke noch ihre Tasks).
- **Zeiterfassung bleibt auf Dummy-Daten** bis Teil 3, sonst passen dort Buchungen (localStorage)
  und Tasks (Directus) nicht zusammen.
- **Keine stillen Fallbacks:** Die `DUMMY_*`-Standardwerte der Komponenten-Props entfallen, die Props
  werden Pflicht.

## Struktur

```
src/services/
  directus/client.ts                       createUserClient(accessToken)  (Umzug aus lib/auth/user-client.ts)
  customer-contacts/
    customer-contacts.types.ts             Directus-Zeilentypen
    customer-contacts.mapper.ts            toCustomerContact          (+ .test.ts)
    customer-contacts.repository.ts        fetchCustomerContacts, fetchCustomerContact
  projects/
    projects.types.ts / projects.mapper.ts (+ .test.ts) / projects.repository.ts
  tasks/
    tasks.types.ts / tasks.mapper.ts (+ .test.ts) / tasks.repository.ts
  work-time/
    work-time.mapper.ts (+ .test.ts) / work-time.repository.ts
```

- **Repository:** nur Laden (Felder, Filter, Sortierung), gibt gemappte Frontend-Modelle zurück.
- **Mapper:** reine Funktionen von Directus-Zeile auf Modell aus `src/models/`; ohne I/O, getestet.
- **Typen:** die Directus-Zeilen (nur die geladenen Felder), getrennt von den Frontend-Modellen.
- Reine Ableitungen ohne Directus-Bezug (Kennzahlen) liegen in `src/lib/`.

## Abbildung

### Project ← `printing_lines`

Filter: `status != cancelled`, Sortierung `pal_date`. Druckstrecken ohne `pal_date` werden übersprungen.

| Project            | Directus                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| `id`               | `id`                                                                                  |
| `name`             | `name`                                                                                |
| `title`            | – (optional, Frontend zeigt `name`)                                                   |
| `status`           | `created` → `created`, `in progress` → `active`, `completed`/`invoiced` → `completed` |
| `palDate`          | `pal_date`                                                                            |
| `dataHandoverDate` | `pal_date − buffer_days` (fehlt `buffer_days`: 0)                                     |
| `customer`         | `tenant.tenant_name`                                                                  |
| `progress`         | `{ done: Anzahl tasks mit completed, total: Anzahl tasks }`                           |
| `circulation`      | `circulation` (fehlt: 0)                                                              |

### Task / TrackedTask ← `tasks`

Filter: `assigned_to = angemeldete Person` und `printing_lines.status != cancelled`, Sortierung `due_date`.

| Task / TrackedTask | Directus                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------- |
| `id`               | `id`                                                                                        |
| `title`            | `task_name`                                                                                 |
| `projectName`      | `printing_lines.name`                                                                       |
| `priority`         | `priority` (fehlt: `medium`)                                                                |
| `dueDate`          | `due_date`                                                                                  |
| `done`             | `completed`                                                                                 |
| `completedAt`      | `completed_at`                                                                              |
| `projectId`        | `printing_lines.id`                                                                         |
| `customer`         | `printing_lines.tenant.tenant_name`                                                         |
| `timeEntries`      | `time_entries` → `{ taskId, startedAt: work_date 08:00, seconds: hours·3600 + minutes·60 }` |

Tasks ohne `due_date` werden übersprungen (das Frontend braucht ein Fälligkeitsdatum).

### WorkDay ← `time_entries`

Einträge der angemeldeten Person (`user_created = $CURRENT_USER`) in der aktuellen Woche Mo–Fr.
Je Tag `actualHours` = Summe der Dauer in Stunden, `targetHours` aus `defaultDailyTarget`
(`lib/time-tracking/calculations/daily-target.ts`), Labels wie bisher (`MON`/`Montag` …).

### ProjectStats ← Projects (reine Funktion in `lib/`)

Nur nicht abgeschlossene Projekte, nach `palDate`:

- **Überfällig:** `palDate` < heute
- **Heute fällig:** `palDate` = heute
- **Diese Woche:** `palDate` nach heute bis Sonntag dieser Woche
- **Anstehend:** `palDate` nach dieser Woche

Icons und Farben wie in den bisherigen Dummy-Kennzahlen.

## Seiten

| Seite            | lädt serverseitig                                              |
| ---------------- | -------------------------------------------------------------- |
| Dashboard `/`    | Projekte, meine Tasks, WorkDays, Kennzahlen; Kunden wie bisher |
| `/projects`      | Projekte                                                       |
| `/tasks`         | meine TrackedTasks                                             |
| `/calendar`      | Projekte + meine TrackedTasks                                  |
| `/time-tracking` | unverändert (Dummy)                                            |

Ohne Session leitet jede Seite wie heute zum Login um (`getRequestSession`). Directus-Fehler
werden nicht abgefangen und führen zur normalen Fehlerseite (wie bei den Kundenkontakten).

## Aufräumen

- Entfällt: `lib/directus.ts`, `lib/customer-contacts-repository.ts` (+ Test, umgezogen),
  `lib/auth/user-client.ts` (umgezogen), `dummy-data/tasks.ts`, `dummy-data/project-stats.ts`,
  `dummy-data/work-time.ts`.
- Bleibt bis Teil 3: `dummy-data/projects.ts`, `dummy-data/tracked-tasks.ts`, `dummy-data/time-entries.ts`
  (nur noch von der Zeiterfassung genutzt).

## Tests

- Vitest für alle Mapper: Statusabbildung, Datenübergabe-Datum, Fortschritt, fehlende Werte,
  Zeiteinträge, WorkDays (Summen, Wochentage, Soll).
- Vitest für die Kennzahlen-Ableitung (Grenzen heute / Wochenende).
- Kundenkontakt-Tests ziehen unverändert mit.
- `npm test`, `npx astro check` (0 errors), `npx eslint src` grün; danach Sichtprüfung gegen die
  echte Directus-Instanz (Dashboard, Projekte, Aufgaben, Kalender).

## Nicht enthalten

- Abhaken in Directus speichern (Teil 2) – bleibt lokal bis zum Neuladen.
- Timer und Zeiterfassung über Directus (Teil 3).
- Zuordnung von Tasks auf weitere User (Daten gehören derzeit dem Admin).
