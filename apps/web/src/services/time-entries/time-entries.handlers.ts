import { toErrorResponse } from "@/lib/customer-contact-form/error-response"
import { isUuid } from "@/utils/is-uuid"
import { jsonResponse } from "@/utils/json-response"
import { readJsonBody } from "@/utils/read-json-body"

import {
  isBookingChanges,
  isDate,
  isWritableBooking,
} from "./time-entries.mapper"
import {
  createTimeEntry,
  deleteTimeEntry,
  fetchBookedTaskIds,
  fetchWeekEntries,
  updateTimeEntry,
} from "./time-entries.repository"

const CONTEXT = "Directus time entries"

export async function handleListEntries(
  url: URL,
  accessToken: string,
  list: typeof fetchWeekEntries = fetchWeekEntries
): Promise<Response> {
  const week = url.searchParams.get("week") ?? ""
  if (!isDate(week)) return jsonResponse(400, { error: "invalid_week" })
  try {
    return jsonResponse(200, { entries: await list(accessToken, week) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleBookedTasks(
  accessToken: string,
  load: typeof fetchBookedTaskIds = fetchBookedTaskIds
): Promise<Response> {
  try {
    return jsonResponse(200, { taskIds: await load(accessToken) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleCreateEntry(
  request: Request,
  accessToken: string,
  create: typeof createTimeEntry = createTimeEntry
): Promise<Response> {
  const body = await readJsonBody<unknown>(request)
  if (!isWritableBooking(body))
    return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(201, { ...(await create(accessToken, body)) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleUpdateEntry(
  request: Request,
  id: string,
  accessToken: string,
  update: typeof updateTimeEntry = updateTimeEntry
): Promise<Response> {
  if (!isUuid(id)) return jsonResponse(400, { error: "invalid_id" })
  const body = await readJsonBody<unknown>(request)
  if (!isBookingChanges(body))
    return jsonResponse(400, { error: "invalid_body" })
  try {
    return jsonResponse(200, { ...(await update(accessToken, id, body)) })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}

export async function handleDeleteEntry(
  id: string,
  accessToken: string,
  remove: typeof deleteTimeEntry = deleteTimeEntry
): Promise<Response> {
  if (!isUuid(id)) return jsonResponse(400, { error: "invalid_id" })
  try {
    await remove(accessToken, id)
    return new Response(null, { status: 204 })
  } catch (error) {
    return toErrorResponse(error, CONTEXT, "invalid_body")
  }
}
