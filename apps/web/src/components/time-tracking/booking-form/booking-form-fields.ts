import { type BookingField } from "@/lib/time-tracking/booking-form"

export const BOOKING_FORM_ID = "booking-form"

export const FIELD_ID = {
  project: "booking-project",
  task: "booking-task",
  date: "booking-date",
  hours: "booking-hours",
  minutes: "booking-minutes",
  description: "booking-description",
} as const

export const DURATION_TOTAL_ID = "booking-duration-total"
export const DESCRIPTION_COUNTER_ID = "booking-description-counter"

export const ERROR_ID: Record<BookingField, string> = {
  project: "booking-project-error",
  task: "booking-task-error",
  duration: "booking-duration-error",
  description: "booking-description-error",
}

const FIELD_SELECTOR: Record<BookingField, string> = {
  project: `#${FIELD_ID.project}`,
  // Gewählte Aufgabe, sonst die erste der Liste.
  task: `input[name="${FIELD_ID.task}"]:checked, input[name="${FIELD_ID.task}"]`,
  duration: `#${FIELD_ID.hours}`,
  description: `#${FIELD_ID.description}`,
}

/** Bringt das Formular ins Bild und setzt den Fokus auf die Dauer. */
export function revealBookingForm(): void {
  requestAnimationFrame(() => {
    document
      .getElementById(BOOKING_FORM_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
    focusBookingField("duration")
  })
}

/** Setzt den Fokus auf ein Formularfeld, z.B. nach dem Vorbefüllen oder bei Fehlern. */
export function focusBookingField(field: BookingField): void {
  document.querySelector<HTMLElement>(FIELD_SELECTOR[field])?.focus()
}
