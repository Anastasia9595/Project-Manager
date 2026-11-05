# Frontend schreibt nach Directus (Teil 2 und 3: Abhaken, Timer, Zeiterfassung) – Design

## Ziel
Abhaken von Aufgaben, der Aufgaben-Timer und die Zeiterfassung speichern in Directus statt im Browser
(`localStorage`) oder nur im Seitenzustand. Aufbauend auf Teil 1 (`docs/superpowers/specs/2026-11-05-directus-read-data-design.md`).

## Entscheidungen
- **Schreiben über API-Routen** unter `src/pages/api/…` mit `withSession` (Muster: `customer-contacts`).
  Die Routen arbeiten mit dem Token der angemeldeten Person; was erlaubt ist, entscheiden die Directus-Rechte.
- **Directus-Logik in den Services** (`src/services/tasks`, `src/services/time-entries`): Repository (Directus SDK),
  Mapper (rein, getestet), Handler (Validierung + Antwort, mit gemocktem Repository getestet).
  Je Bereich ein dünner Browser-Client (`*.client.ts`), den die Komponenten nutzen.
- **Der laufende Timer bleibt im Browser** (`localStorage`, überlebt Tabs und Neuladen). Nur der fertige Eintrag geht nach Directus.
- **Rundung des Timers:** Sekunden auf volle Minuten gerundet, mindestens 1 Minute (Directus kennt nur Stunden und Minuten).
- **Directus-Rechte erweitert der Nutzer selbst** (Liste unten); der Code geht davon aus.
- **Zeiterfassung nur für Admin und Agentur** (`canViewInternalWork`); Kunden werden umgeleitet.

## Teil 2: Abhaken
- `PATCH /api/tasks/[id]` mit `{ "completed": boolean }`. Server setzt `completed_at` = jetzt (ISO) bei `true`, `null` bei `false`.
  Antwort `200 { "id", "completed", "completedAt" }`. Fehler: `400 invalid_body`, Directus-Status wird durchgereicht (403/404), sonst 500.
- Betroffen: „Meine Aufgaben“ (Dashboard) und Kalender (inkl. Rückfrage beim Wieder-Öffnen).
  Anzeige sofort (optimistisch); bei Fehler zurücksetzen und Toast (`sonner`).
- Hat die Aufgabe einen laufenden Timer, wird er beim Abhaken wie bisher gestoppt und gebucht.

## Teil 3: Timer und Zeiterfassung

### Abbildung `TimeBooking` ↔ `time_entries`
| TimeBooking | Directus `time_entries` |
|---|---|
| `id` | `id` |
| `date` | `work_date` |
| `duration_minutes` | `hours`·60 + `minutes` (Schreiben: `splitMinutes`) |
| `description` | `note` |
| `task` | `task` |
| `project` | `task.printing_lines.id` (nur Lesen, wird nicht gespeichert) |
| `user` | `user_created` (nur Lesen) |

### API
- `GET /api/time-entries?week=YYYY-MM-DD` (Montag der Woche) → `TimeBooking[]` der Person (Filter `user_created = $CURRENT_USER`).
- `GET /api/time-entries/booked-tasks` → `string[]` Task-IDs mit mindestens einer eigenen Buchung.
- `POST /api/time-entries` Body `{ task, date, duration_minutes, description }` → `201 TimeBooking`.
- `PATCH /api/time-entries/[id]` Body teilweise wie POST → `200 TimeBooking`.
- `DELETE /api/time-entries/[id]` → `204`.
- Validierung: `task` nicht-leerer String, `date` `YYYY-MM-DD`, `duration_minutes` ganze Zahl 1–1440, `description` String (max. 2000) oder `null`; sonst `400 invalid_body`.

### Timer
- `useTaskTimerStore.stop()` beendet den Timer und gibt den fertigen Eintrag `{ taskId, startedAt, seconds }` zurück (oder `null`).
  `entries` im Store ist nur noch Sitzungszustand für die sofortige Anzeige und wird nicht mehr persistiert; `discardEntry` entfernt einen Eintrag wieder.
- `bookTimerEntry(entry)` (Browser-Client) bucht den Eintrag: `work_date` = Tag von `startedAt` (Ortszeit), Minuten = `max(1, round(seconds/60))`.
  Bei Fehler: Eintrag verwerfen und Toast.

### Zeiterfassungs-Seite
- `createTimeBookingRepository(userId)` behält seine Schnittstelle, ruft aber die API statt `localStorage`.
- `/time-tracking` lädt Projekte und meine Aufgaben aus Directus (Teil-1-Services) und reicht sie als Props durch.
- Alle Dateien in `src/dummy-data/` entfallen.

## Directus-Rechte (vom Nutzer zu setzen)
Rolle „Agentur Mitarbeiter“ (Policy „Orange Mitarbeiter“), Collection `time_entries`:
- `read`: Filter `user_created = $CURRENT_USER` (bisher ungefiltert)
- `update`: Felder `*`, Filter `user_created = $CURRENT_USER` (neu)
- `delete`: Filter `user_created = $CURRENT_USER` (neu)
`create` und `tasks.update` (eigene Aufgaben) bestehen bereits.

## Testdaten
Neuer Seed-Modus `--assign-tasks` (in `scripts/`, wie `--extras`) verteilt Aufgaben und Zeiteinträge reihum auf Admin und die beiden Agentur-Logins (nur Besitzerwechsel, nichts wird gelöscht).

## Tests
- Vitest: Mapper (Minuten ↔ Stunden, Rundung, `TimeBooking`), Handler (Validierung, Fehlerabbildung, gemocktes Repository), Timer-Store (`stop` gibt Eintrag zurück, nichts persistiert).
- `npm test`, `npx astro check` (0 errors), `npx eslint src`.
- Live: App-Login als Agentur-Konto, Abhaken, Timer, Buchen, Ändern, Löschen; danach Directus-Stand prüfen.

## Nicht enthalten
Aufgaben anlegen/bearbeiten, Rechte für die Rolle Kunden, Verteilen weiterer Aufgaben außer dem Seed-Modus.
