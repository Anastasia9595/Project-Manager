# Task Filter and View Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aufgaben-Seite bekommt Filter (Priorität, Projekt, Kunde), Icons im Umschalter und hellere Kanban-Spalten.

**Architecture:** Reine Filterfunktion in `apps/web/src/lib/tracked-tasks.ts`, rein clientseitig. Eine neue Komponente für Button, Popover und Chips; Zeile unter den Zeiterfassungs-Karten.

**Tech Stack:** React 19, Tailwind 4, `@workspace/ui` (Button, Popover, Checkbox), Hugeicons, Vitest.

## Global Constraints

- Nur Design-Tokens aus `packages/ui/src/styles/globals.css`.
- `de.ts` und `en.ts` synchron halten.
- Innerhalb eines Kriteriums "oder", zwischen Kriterien "und".
- Erfasste Zeiten, laufender Timer und Anzahl offener Aufgaben bleiben ungefiltert.
- Kein Commit ohne Auftrag.

## Task 1: Filterlogik

- [ ] Test `apps/web/src/lib/tracked-tasks.test.ts` (fehlschlagend)
- [ ] `TaskFilter`, `EMPTY_TASK_FILTER`, `matchesTaskFilter(task, filter)` in `lib/tracked-tasks.ts`
- [ ] `useTrackedTasks(tasks, query, filter)` wendet den Filter an
- [ ] `npm test -w web -- src/lib/tracked-tasks.test.ts`

## Task 2: Oberfläche

- [ ] `components/tasks/view/task-filter.tsx`: Button mit Anzahl, Popover mit Checkboxen, Chips, Zurücksetzen
- [ ] Texte `tasksPage.filter` in `i18n/de.ts` und `i18n/en.ts`
- [ ] `tasks-page.tsx`: Zeile unter `TimeSummaryCards`, Umschalter aus dem Seitenkopf dorthin
- [ ] `tasks-view-switch.tsx`: Icons `LeftToRightListBulletIcon`, `KanbanIcon`
- [ ] `task-board.tsx`: Spalten `bg-muted/20`
- [ ] `npm test`, `npm run typecheck`, ESLint in `apps/web`
