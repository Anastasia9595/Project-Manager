import { useMemo } from "react"

import { MINUTE_MS, useNow } from "@/hooks/use-now"
import { parseDayKey, toDayKey } from "@/lib/week"

/** Heute (00:00 Uhr) als stabiles Datum – ändert sich erst beim Tageswechsel. */
export function useToday(): Date {
  const todayKey = toDayKey(new Date(useNow(MINUTE_MS)))
  return useMemo(() => parseDayKey(todayKey), [todayKey])
}
