import { useEffect, useState } from "react"

/** Aktueller Zeitstempel, der alle `intervalMs` Millisekunden neu gesetzt wird. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
