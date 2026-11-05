import { readItems } from "@directus/sdk"

import { getWorkweekDays, startOfWeek, toDayKey } from "@/lib/week"
import type { WorkDay } from "@/models/work-day"
import { createUserClient } from "@/services/directus/client"
import type { TimeEntryRow } from "@/services/time-entries/time-entries.types"

import { toWorkWeek } from "./work-time.mapper"

/** Arbeitszeit der angemeldeten Person in der Woche (Mo–Fr), in der `today` liegt. */
export async function fetchWorkWeek(
  accessToken: string,
  today: Date = new Date()
): Promise<WorkDay[]> {
  const weekStart = startOfWeek(today)
  const days = getWorkweekDays(weekStart)
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("time_entries", {
      fields: ["work_date", "hours", "minutes"],
      filter: {
        user_created: { _eq: "$CURRENT_USER" },
        work_date: {
          _between: [toDayKey(days[0]!), toDayKey(days[days.length - 1]!)],
        },
      },
      limit: -1,
    })
  )) as unknown as TimeEntryRow[]
  return toWorkWeek(rows, weekStart)
}
