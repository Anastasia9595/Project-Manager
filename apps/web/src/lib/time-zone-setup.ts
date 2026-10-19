// Seiteneffekt-Modul: als ERSTER Import in middleware.ts eingebunden, damit die
// Zeitzone gesetzt ist, bevor andere Module Datumswerte oder Intl-Formatter anlegen.
// Primär wird `TZ` schon beim Prozessstart gesetzt (Skripte in package.json).
import { applyAppTimeZone } from "@/lib/time-zone"

applyAppTimeZone()
