/**
 * Zeitzone, in der der Server „heute“, Wochen und Fälligkeiten berechnet.
 * Alle Mitarbeitenden arbeiten in Deutschland – so rechnen Server-Rendering und
 * Browser mit demselben Tag (sonst Hydration-Fehler zwischen 0 und ~2 Uhr, wenn
 * der Server z.B. in UTC läuft).
 */
export const APP_TIME_ZONE = "Europe/Berlin"

/**
 * Setzt die Zeitzone des Node-Prozesses. Bereits angelegte Intl-Formatter
 * behalten ihre Zone – deshalb setzen die Skripte `dev`/`start` in package.json
 * `TZ=Europe/Berlin` schon beim Prozessstart; dies ist nur die Rückfalllösung.
 */
export function applyAppTimeZone(): void {
  process.env.TZ = APP_TIME_ZONE
}
