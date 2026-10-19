import { splitMinutes } from "@/lib/time-tracking/calculations/duration"
import {
  durationMinutes,
  validateDuration,
  type DurationError,
} from "@/lib/time-tracking/duration-input"
import type { TimeBooking, TimeBookingInput } from "@/models/time-booking"

/** Formularzustand – Dauer als Text, damit leere Eingaben möglich sind. */
export type BookingFormValues = {
  projectId: string | null
  taskId: string | null
  /** Tag als `toDayKey`, z.B. "2026-10-14". */
  date: string
  hours: string
  minutes: string
  description: string
}

export type BookingField = "project" | "task" | "duration" | "description"
export type BookingFormErrors = {
  project?: true
  task?: true
  duration?: DurationError
  description?: true
}

/** Pflichtfelder in Anzeigereihenfolge – bestimmt, welches Feld den Fokus bekommt. */
export const BOOKING_FIELDS: BookingField[] = [
  "project",
  "task",
  "duration",
  "description",
]

/** Standardlänge eines Directus-Felds vom Typ `string` (varchar 255). */
export const DESCRIPTION_MAX_LENGTH = 255

const MINUTES_DISPLAY_LENGTH = 2

export function emptyBookingValues(date: string): BookingFormValues {
  return {
    projectId: null,
    taskId: null,
    date,
    hours: "",
    minutes: "",
    description: "",
  }
}

export function bookingToValues(entry: TimeBooking): BookingFormValues {
  const { hours, minutes } = splitMinutes(entry.duration_minutes)
  return {
    projectId: entry.project,
    taskId: entry.task,
    date: entry.date,
    hours: String(hours),
    minutes: String(minutes).padStart(MINUTES_DISPLAY_LENGTH, "0"),
    description: entry.description ?? "",
  }
}

export function validateBooking(values: BookingFormValues): BookingFormErrors {
  const errors: BookingFormErrors = {}
  if (!values.projectId) errors.project = true
  if (!values.taskId) errors.task = true
  const durationError = validateDuration(values)
  if (durationError) errors.duration = durationError
  if (values.description.trim().length > DESCRIPTION_MAX_LENGTH) {
    errors.description = true
  }
  return errors
}

export function firstInvalidField(
  errors: BookingFormErrors
): BookingField | undefined {
  return BOOKING_FIELDS.find((field) => errors[field])
}

/** Erwartet geprüfte Werte (siehe `validateBooking`). */
export function toBookingInput(
  values: BookingFormValues,
  userId: string
): TimeBookingInput {
  return {
    project: values.projectId!,
    task: values.taskId!,
    date: values.date,
    duration_minutes: durationMinutes(values),
    description: values.description.trim() || null,
    user: userId,
  }
}

/** Buchung ohne `id`, z.B. um einen gelöschten Eintrag wiederherzustellen. */
export function withoutId(entry: TimeBooking): TimeBookingInput {
  const { project, task, date, duration_minutes, description, user } = entry
  return { project, task, date, duration_minutes, description, user }
}
