import { toast } from "sonner"

import type { BookingFormState } from "@/hooks/use-booking-form"
import type { useWeekBookings } from "@/hooks/use-week-bookings"
import type { Dictionary } from "@/i18n"
import {
  toBookingInput,
  withoutId,
  type BookingFormValues,
} from "@/lib/time-tracking/booking-form"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import type { TimeBooking } from "@/models/time-booking"
import { fillTemplate } from "@/utils/fill-template"

type ToastLabels = Dictionary["timeTrackingPage"]["toast"]

/** Buchen, Speichern und Löschen – jeweils mit Toast und „Rückgängig“. */
export function useBookingActions({
  bookings,
  form,
  userId,
  labels,
}: {
  bookings: ReturnType<typeof useWeekBookings>
  form: BookingFormState
  userId: string
  labels: ToastLabels
}) {
  /** Führt eine Änderung aus; bei einem Fehler Toast und `null`. */
  async function attempt<T>(action: () => Promise<T>): Promise<T | null> {
    try {
      return await action()
    } catch {
      toast.error(labels.error)
      return null
    }
  }

  function showUndoToast(message: string, undo: () => Promise<unknown>) {
    toast.success(message, {
      action: {
        label: labels.undo,
        onClick: async () => {
          if ((await attempt(undo)) !== null) toast(labels.undone)
        },
      },
    })
  }

  async function createBooking(values: BookingFormValues) {
    const created = await attempt(() =>
      bookings.create(toBookingInput(values, userId))
    )
    if (!created) return
    showUndoToast(
      fillTemplate(labels.created, {
        duration: formatDuration(created.duration_minutes),
      }),
      async () => {
        await bookings.remove(created.id)
        // Der rückgängig gemachte Eintrag darf nicht im Formular weiterleben.
        form.discardEntry(created.id)
      }
    )
    form.resetAfterSubmit()
  }

  async function saveBooking(previous: TimeBooking, values: BookingFormValues) {
    const updated = await attempt(() =>
      bookings.update(previous.id, toBookingInput(values, previous.user))
    )
    if (!updated) return
    showUndoToast(labels.updated, () =>
      bookings.update(previous.id, withoutId(previous))
    )
    form.resetAfterSubmit()
  }

  async function submitBooking(values: BookingFormValues) {
    if (form.editing) await saveBooking(form.editing, values)
    else await createBooking(values)
  }

  /** Löscht einen Eintrag; `false`, wenn das Löschen fehlgeschlagen ist. */
  async function deleteBooking(entry: TimeBooking): Promise<boolean> {
    const deleted = await attempt(async () => {
      await bookings.remove(entry.id)
      return entry
    })
    if (!deleted) return false
    form.discardEntry(entry.id)
    showUndoToast(labels.deleted, () => bookings.create(withoutId(entry)))
    return true
  }

  return { submitBooking, deleteBooking }
}
