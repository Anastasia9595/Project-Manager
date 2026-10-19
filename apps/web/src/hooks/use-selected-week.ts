import { useMemo, useSyncExternalStore } from "react"

import {
  WEEK_PARAM,
  formatWeekParam,
  resolveWeekStart,
} from "@/lib/time-tracking/week-param"
import { parseDayKey, toDayKey } from "@/lib/week"

// Die gewählte Woche steht in der URL (`?week=2026-W42`) – sie ist damit teilbar,
// übersteht ein Neuladen und ist die gemeinsame Quelle für alle Inseln der Seite
// (Wochennavigation im Seitenkopf und Arbeitsbereich).

const WEEK_CHANGE_EVENT = "time-tracking:week-change"

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange)
  window.addEventListener(WEEK_CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener("popstate", onChange)
    window.removeEventListener(WEEK_CHANGE_EVENT, onChange)
  }
}

function readWeekParam(): string | null {
  return new URL(window.location.href).searchParams.get(WEEK_PARAM)
}

/** Wechselt die Woche ohne Neuladen; Zurück/Vor im Browser funktionieren weiter. */
export function navigateToWeek(weekStart: Date): void {
  const url = new URL(window.location.href)
  url.searchParams.set(WEEK_PARAM, formatWeekParam(weekStart))
  window.history.pushState(null, "", url)
  window.dispatchEvent(new Event(WEEK_CHANGE_EVENT))
}

/**
 * Montag der angezeigten Woche. `initialParam` ist der vom Server gelesene
 * URL-Parameter, damit Server- und Browser-Rendering übereinstimmen.
 */
export function useSelectedWeek(initialParam: string | null, today: Date): Date {
  const param = useSyncExternalStore(subscribe, readWeekParam, () => initialParam)
  // Nur bei Tageswechsel neu berechnen, nicht bei jedem Tick der Uhr.
  const todayKey = toDayKey(today)
  return useMemo(
    () => resolveWeekStart(param, parseDayKey(todayKey)),
    [param, todayKey]
  )
}
