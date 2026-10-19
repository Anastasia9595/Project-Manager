# Kalender: Aufgaben-Status aus der Zeiterfassung – Design

## Ziel
„In Bearbeitung“ wird nicht mehr manuell gepflegt, sondern automatisch aus der
Zeiterfassung abgeleitet. Die Checkbox einer Aufgabe bedeutet weiterhin „erledigt“.

## Entscheidungen
- **Nur `done` wird gespeichert.** Alle anderen Status werden berechnet; kein manuelles
  Statusmenü (kann später ergänzt werden, falls im Alltag nötig).
- **In Bearbeitung** = nicht erledigt **und** (Timer läuft **oder** irgendeine Zeit gebucht).
  Nach dem Stoppen des Timers bleibt die Aufgabe in Bearbeitung.
- **Überfällig (roter Chip)** gibt es nur noch für unbearbeitete Aufgaben mit Fälligkeit < heute.
  Begonnene überfällige Aufgaben zeigen „In Bearbeitung“ mit roter Fußzeile.
- **Abhaken mit laufendem Timer** stoppt den Timer und bucht die Zeit.
- Das Feld `Task.inProgress` und die `inProgress`-Flags in den Dummy-Daten entfallen.

## Darstellung (Chip / Fußzeile)
| Bedingung                                   | Chip                     | Fußzeile                          |
|---------------------------------------------|--------------------------|-----------------------------------|
| erledigt                                    | Abgeschlossen (grün)     | grau „Abgeschlossen am TT.MM“     |
| nicht erledigt, Timer läuft oder Zeit gebucht | In Bearbeitung (gelb)  | nach Datumsregeln, rot wenn überfällig |
| nicht erledigt, keine Zeit, überfällig      | Überfällig (rot)         | rot „Fällig am TT.MM · seit X Tagen“ |
| nicht erledigt, keine Zeit                  | Offen                    | nach Datumsregeln                 |

Projekte bleiben unverändert (aktiv = In Bearbeitung, Fußzeile nach Datum).

## Sortierung je Tag
Unverändert über `STATUS_RANK`: Überfällig (rot) → In Bearbeitung → Offen → Abgeschlossen;
bei Gleichstand frühere Fälligkeit, dann Projekt vor Aufgabe. Ein zusätzliches
`overdue`-Merkmal ist nicht nötig: Alle Einträge eines Tages haben dieselbe Fälligkeit,
an vergangenen Tagen sind also alle nicht erledigten Einträge überfällig, an heutigen und
künftigen keiner. Ergebnis:
- vergangene Tage: Überfällig (unbearbeitet) → In Bearbeitung (rote Fußzeile) → Abgeschlossen
- heute/künftig: In Bearbeitung → Offen → Abgeschlossen

Die nach dem Abhaken eingefrorene Reihenfolge (`withPinnedOrder`) bleibt bestehen.

## Datenfluss
- `CalendarPage` erwartet `TrackedTask[]` (Aufgabe inkl. `timeEntries`) statt `Task[]`.
  Für Directus müssen die Zeiteinträge mitgeladen werden.
- Die Seite liest `active` und `entries` aus `useTaskTimerStore` und ruft
  `rehydrateTaskTimer()` nach dem Mount auf (wie `useTrackedTasks`); dadurch wirken
  Timer-Starts auf der Aufgaben-Seite und in anderen Tabs auch im Kalender.
- `lib/calendar/entries.ts`:
  - `getStartedTaskIds(tasks, bookedEntries, activeTaskId)` → `Set<string>` aller
    Aufgaben mit Zeiteinträgen (Aufgabendaten oder Store) oder laufendem Timer.
  - `taskToEntry(task, today, startedTaskIds)` leitet den Chip-Status ab;
    `toCalendarEntries(tasks, projects, today, startedTaskIds)` reicht die Menge durch.
- Abhaken (`toggleTask`): läuft der Timer für diese Aufgabe, zuerst `stop()` aufrufen,
  dann `done` setzen. Wieder öffnen (nach Dialog) berechnet den Status neu.

## Tests (Vitest)
- `getStartedTaskIds`: laufender Timer, Zeit aus Aufgabendaten, Zeit nur im Store, keine Zeit.
- `taskToEntry`: alle vier Tabellenzeilen inkl. „überfällig + in Bearbeitung → gelber Chip“
  und „wieder geöffnet mit gebuchter Zeit → In Bearbeitung“.
- Sortierung an einem vergangenen Tag: Überfällig (unbearbeitet) vor In Bearbeitung vor
  Abgeschlossen.
