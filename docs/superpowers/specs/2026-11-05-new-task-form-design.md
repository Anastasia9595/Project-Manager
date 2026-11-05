# Formular „Neue Aufgabe" (tasks anlegen) – Design

## Ziel
Der Button „Neue Aufgabe" auf `/tasks` öffnet einen Dialog (Design und Verhalten wie „Neues Projekt").
Eine Aufgabe entsteht frei oder aus einer Vorlage (`task_templates`) und gehört immer zu einem Projekt (`printing_lines`).
Aufbauend auf `docs/superpowers/specs/2026-11-05-new-project-form-design.md`.

## Befunde aus dem Directus-Schema
- `tasks.printing_lines` ist in Directus nullable → Pflicht erzwingen wir im Formular und auf dem Server.
- Das Frontend (`toTrackedTasks`) überspringt Aufgaben ohne `due_date` → Fälligkeit ist Pflicht.
- `tasks.status` hat den Default `draft`; die Testdaten haben `published` → immer `published` senden.
- Die Rolle „Orange Mitarbeiter" darf `tasks` anlegen und lesen (nur eigene: `assigned_to` oder `user_created` = ich) und `task_templates` lesen, aber keine `directus_users` auflisten → `assigned_to` = angemeldete Person.
- `task_templates`: `task_name` (Pflicht), `description`, `due_date_anchor` (`date_created | pal_date | delivery_date | distribution_date`), `due_date_offset` (Ganzzahl, Tage), `status`, `sort`.

## Formular
Vorlage (optional), Titel (Pflicht, ≤ 200), Projekt (Pflicht), Fälligkeitsdatum (Pflicht, `YYYY-MM-DD`, auch Vergangenheit erlaubt),
Priorität (`high | medium | low`, Standard `medium`), Beschreibung (optional, ≤ 2000).
Projekte zur Auswahl: `status` in `created` oder `in progress`.

Vorlage wählen füllt Titel, Beschreibung und Fälligkeit vor (alles bleibt änderbar). Fälligkeit = Ankerdatum + Versatz:
`date_created` → heute (lokal); `pal_date` / `delivery_date` / `distribution_date` → das Datum des gewählten Projekts.
Fehlt das Datum (oder noch kein Projekt gewählt), bleibt das Feld leer. Projekt wechseln berechnet die Fälligkeit neu,
solange die Person sie nicht selbst geändert hat. „Vorlage entfernen" lässt die eingetragenen Werte stehen.

## Speichern (`POST /api/tasks`)
1. Rolle prüfen (`canViewInternalWork`, sonst `403`), Body (`isNewTaskValues`, sonst `400 invalid_body`), Felder (`validateNewTask(values)`, sonst `400 invalid_fields`).
2. Projekt lesen (`readItem printing_lines`, Felder `status`); fehlt es oder ist 403/404 → `400 invalid_project`; Status nicht `created`/`in progress` → `400 invalid_project`.
3. `createItem("tasks", { task_name, description, priority, due_date, printing_lines, assigned_to: userId, status: "published", completed: false })`.
4. `201 { id, name }`; Directus-Fehler über `toErrorResponse`.

`GET /api/tasks/options` → `{ projects: { id, name, customer, palDate, deliveryDate, distributionDate }[]; templates: { id, name, description, anchor, offset }[] }` (Projekte `created`/`in progress` nach `pal_date`, Vorlagen `published` nach `sort`). Nur Admin/Agentur (`403` sonst).

## Struktur
```
src/services/tasks/
  new-task.values.ts        NewTaskValues, EMPTY_NEW_TASK_VALUES, isNewTaskValues
  new-task.validation.ts    validateNewTask(values), MAX_LENGTH             (+ Test)
  new-task.types.ts         TaskOptions, Directus-Zeilentypen der Optionen
  new-task.mapper.ts        toTaskPayload, toTaskOptions, computeDueDate     (+ Test)
  new-task.repository.ts    fetchTaskOptions, fetchTaskProject, createTask
  new-task.handlers.ts      handleCreateTask, handleTaskOptions              (+ Test)
  tasks.client.ts           + submitNewTask (bestehende Datei erweitern)     (+ Test)
src/pages/api/tasks/index.ts (POST), options.ts (GET)
src/hooks/use-task-options.ts, use-new-task-form.ts
src/components/tasks/new-task/   new-task-form.tsx, Feldgruppen, form-helpers
src/i18n/de.ts, en.ts            tasksPage.form
```
Anbindung: `tasks.astro` übergibt nichts Neues (Seite ist schon nur für Admin/Agentur); `TasksPage` öffnet den Dialog über den vorhandenen `CreateButton`.
Nach dem Speichern: Dialog zu, Toast, Neuladen nach kurzer Verzögerung (wie beim Projekt-Formular).

## Tests
Vitest: Validierung, Mapper (Payload, `computeDueDate` inkl. negativem Versatz, Monatsgrenze, fehlendem Datum), Handler (403/400/Projekt ungültig/201/Fehlerabbildung),
Client, Form-Helfer. `npm test`, `npx astro check` (0 Fehler), `npx eslint src`. Live-Test mit Agentur-Login (Aufgabe anlegen, in Directus prüfen, danach löschen nach Freigabe).

## Nicht enthalten
Zuweisen an andere Personen, mehrere Vorlagen auf einmal, Aufgaben bearbeiten/löschen, Zeiten beim Anlegen.
