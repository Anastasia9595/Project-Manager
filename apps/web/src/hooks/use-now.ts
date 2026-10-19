import { useEffect, useState } from "react"

/** Aktualisierungsintervall für Anzeigen, die nur die Uhrzeit auf die Minute brauchen. */
export const MINUTE_MS = 60_000

/** Aktueller Zeitstempel, der alle `intervalMs` Millisekunden neu gesetzt wird. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
