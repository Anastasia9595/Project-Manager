import { createItem, deleteItem, readItems, updateItem } from "@directus/sdk"

import { addDays, parseDayKey, toDayKey } from "@/lib/week"
import type { TimeBooking } from "@/models/time-booking"
import { createUserClient } from "@/services/directus/client"

import {
  toTimeBooking,
  toTimeEntryChanges,
  toTimeEntryWrite,
} from "./time-entries.mapper"
import type { TimeBookingRow, WritableBooking } from "./time-entries.types"

const FIELDS = [
  "id",
  "work_date",
  "hours",
  "minutes",
  "note",
  "user_created",
  "task.id",
  "task.printing_lines.id",
]

/** Buchungen der angemeldeten Person von Montag `weekStart` bis Sonntag (Format "YYYY-MM-DD"). */
export async function fetchWeekEntries(
  accessToken: string,
  weekStart: string
): Promise<TimeBooking[]> {
  const client = await createUserClient(accessToken)
  const weekEnd = toDayKey(addDays(parseDayKey(weekStart), 6))
  const rows = (await client.request(
    readItems("time_entries", {
      fields: FIELDS,
      filter: {
        user_created: { _eq: "$CURRENT_USER" },
        work_date: { _between: [weekStart, weekEnd] },
      },
      sort: ["work_date", "date_created"],
      limit: -1,
    })
  )) as unknown as TimeBookingRow[]
  return rows.map(toTimeBooking)
}

/** IDs aller Aufgaben, auf die die angemeldete Person mindestens einmal gebucht hat. */
export async function fetchBookedTaskIds(
  accessToken: string
): Promise<string[]> {
  const client = await createUserClient(accessToken)
  const rows = (await client.request(
    readItems("time_entries", {
      fields: ["task"],
      filter: { user_created: { _eq: "$CURRENT_USER" } },
      limit: -1,
    })
  )) as unknown as { task: string }[]
  return [...new Set(rows.map((row) => row.task))]
}

export async function createTimeEntry(
  accessToken: string,
  input: WritableBooking
): Promise<TimeBooking> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    createItem("time_entries", toTimeEntryWrite(input), { fields: FIELDS })
  )) as unknown as TimeBookingRow
  return toTimeBooking(row)
}

export async function updateTimeEntry(
  accessToken: string,
  id: string,
  changes: Partial<WritableBooking>
): Promise<TimeBooking> {
  const client = await createUserClient(accessToken)
  const row = (await client.request(
    updateItem("time_entries", id, toTimeEntryChanges(changes), {
      fields: FIELDS,
    })
  )) as unknown as TimeBookingRow
  return toTimeBooking(row)
}

export async function deleteTimeEntry(
  accessToken: string,
  id: string
): Promise<void> {
  const client = await createUserClient(accessToken)
  await client.request(deleteItem("time_entries", id))
}
