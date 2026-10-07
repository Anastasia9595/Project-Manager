# Aufgaben-Seite ("Meine Aufgaben") – Design

## Ziel
Neue Seite `/tasks` nach Figma-Screenshot: Kopf mit Suche + "Neue Aufgabe", zwei
Kacheln (heute / diese Woche erfasst), Timer-Leiste und einklappbare Aufgaben-Gruppen.

## Entscheidungen
- **Ein Timer gleichzeitig:** läuft ein Timer, sind alle anderen Play-Buttons deaktiviert.
- **Persistenz:** aktiver Timer (`taskId`, `startedAt`) und gebuchte Zeiteinträge liegen in
  `localStorage`; ohne `localStorage` läuft alles nur im Speicher weiter.
- **Zeiten live berechnet:** Zeit-Spalte und Kacheln = Summe der Zeiteinträge + laufender Timer.
- **"Neue Aufgabe"** ist nur optisch vorhanden (wie "Neues Projekt").
- Suche filtert nach Aufgabe, Projekt und Kunde; Spalten sortierbar; Gruppen einklappbar.

## Gruppen
- Überfällig (Fälligkeit < heute), Heute fällig, Diese Woche (morgen bis +7 Tage),
  Später (> 7 Tage, nur wenn nicht leer). Leere Gruppen werden ausgeblendet.

## Aufbau
- `pages/tasks.astro` → `components/tasks/tasks-page.tsx` (`client:load`)
- `components/shared/`: `page-header`, `search-input`, `create-button` (auch von Projekte-
  und Kundenkontakte-Seite genutzt)
- `components/tasks/`: `running-timer-bar`, `tasks-empty-state`, `time-summary/`,
  `task-group/` (Gruppe + Trigger), `task-table/` (Spalten + Zellen)
- `hooks/use-tracked-tasks.ts`: leitet Summen, laufenden Timer und Gruppen ab
- `lib/task-timer-store.ts`: Zustand-Store mit `persist`-Middleware (`localStorage`)
- `lib/tracked-tasks.ts`: Gruppierung, Summen, Formatierung
- `hooks/use-now.ts`: tickt jede Sekunde bei laufendem Timer, sonst jede Minute
- `models/task.ts`: `TrackedTask = Task & { customer, timeEntries }` (Dashboard-`Task` bleibt unverändert)
- `dummy-data/tracked-tasks.ts`: Projekte/Kunden aus `DUMMY_PROJECTS`, Termine relativ zu heute
- Texte in `i18n` unter `tasksPage`

## Prüfung
`astro check`, `eslint`, manuell im Browser (kein Test-Setup im Projekt vorhanden).
