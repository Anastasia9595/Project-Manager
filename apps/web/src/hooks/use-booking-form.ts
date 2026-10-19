import { useEffect, useRef, useState } from "react"

import {
  bookingToValues,
  emptyBookingValues,
  type BookingFormValues,
} from "@/lib/time-tracking/booking-form"
import type { TimeBooking } from "@/models/time-booking"

export type BookingPrefill = Pick<BookingFormValues, "projectId" | "taskId" | "date">

/**
 * Zustand des Formulars „Zeit buchen“ / „Eintrag bearbeiten“.
 * `defaultDate` ist die Vorbelegung des Datums; `weekKey` die angezeigte Woche.
 */
export function useBookingForm(defaultDate: string, weekKey: string) {
  const [values, setValues] = useState(() => emptyBookingValues(defaultDate))
  const [editing, setEditing] = useState<TimeBooking | null>(null)
  const [showErrors, setShowErrors] = useState(false)

  // Wochenwechsel: Datum der neuen Woche vorbelegen (Zustand während des Renderns
  // anpassen statt per Effekt, siehe React-Doku „You Might Not Need an Effect“).
  // Nur bei Wochen-, nicht bei Tageswechsel – sonst bräche Mitternacht eine
  // laufende Bearbeitung ab.
  const [previousWeek, setPreviousWeek] = useState(weekKey)
  if (previousWeek !== weekKey) {
    setPreviousWeek(weekKey)
    if (editing) {
      // Bearbeitung abbrechen: Dauer und Beschreibung des alten Eintrags dürfen
      // nicht als neue Buchung in der anderen Woche landen (sonst Duplikat).
      setValues((current) => ({
        ...emptyBookingValues(defaultDate),
        projectId: current.projectId,
        taskId: current.taskId,
      }))
      setEditing(null)
      setShowErrors(false)
    } else {
      setValues((current) => ({ ...current, date: defaultDate }))
    }
  }

  // Aktueller Bearbeitungsstand für spätere Callbacks (z.B. „Rückgängig“ im Toast).
  const editingRef = useRef(editing)
  useEffect(() => {
    editingRef.current = editing
  }, [editing])

  function change(patch: Partial<BookingFormValues>) {
    setValues((current) => ({ ...current, ...patch }))
  }

  function reset() {
    setValues(emptyBookingValues(defaultDate))
    setEditing(null)
    setShowErrors(false)
  }

  /** Nach dem Buchen: Projekt, Aufgabe und Datum für die nächste Buchung behalten. */
  function resetAfterSubmit() {
    setValues((current) => ({
      ...emptyBookingValues(current.date),
      projectId: current.projectId,
      taskId: current.taskId,
    }))
    setEditing(null)
    setShowErrors(false)
  }

  /** Formular leeren, falls gerade dieser (gelöschte) Eintrag bearbeitet wird. */
  function discardEntry(entryId: string) {
    if (editingRef.current?.id === entryId) reset()
  }

  function prefill({ projectId, taskId, date }: BookingPrefill) {
    setValues({ ...emptyBookingValues(date), projectId, taskId })
    setEditing(null)
    setShowErrors(false)
  }

  function startEdit(entry: TimeBooking) {
    setValues(bookingToValues(entry))
    setEditing(entry)
    setShowErrors(false)
  }

  return {
    values,
    editing,
    showErrors,
    setShowErrors,
    change,
    reset,
    resetAfterSubmit,
    discardEntry,
    prefill,
    startEdit,
  }
}

export type BookingFormState = ReturnType<typeof useBookingForm>
