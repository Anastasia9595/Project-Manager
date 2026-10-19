import { useState, type SubmitEvent } from "react"

import { Card } from "@/components/shared/card"
import {
  BOOKING_FORM_ID,
  focusBookingField,
} from "@/components/time-tracking/booking-form/booking-form-fields"
import { DateField } from "@/components/time-tracking/booking-form/date-field"
import { DescriptionField } from "@/components/time-tracking/booking-form/description-field"
import { DurationField } from "@/components/time-tracking/booking-form/duration-field"
import { FieldMessage } from "@/components/time-tracking/booking-form/field-message"
import { FormActions } from "@/components/time-tracking/booking-form/form-actions"
import type { FormLabels } from "@/components/time-tracking/booking-form/form-layout"
import { ProjectField } from "@/components/time-tracking/booking-form/project-field"
import { TaskField } from "@/components/time-tracking/booking-form/task-field"
import type { BookingFormState } from "@/hooks/use-booking-form"
import type { Dictionary } from "@/i18n"
import {
  firstInvalidField,
  validateBooking,
  type BookingFormValues,
} from "@/lib/time-tracking/booking-form"
import { formatDuration } from "@/lib/time-tracking/calculations/duration"
import { durationMinutes } from "@/lib/time-tracking/duration-input"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"

/** Formular „Zeit buchen“ / „Eintrag bearbeiten“. */
export function BookingForm({
  form,
  labels,
  statusLabels,
  projects,
  tasks,
  bookableDays,
  startedTaskIds,
  otherMinutesOnDate,
  onSubmit,
  onDelete,
}: {
  form: BookingFormState
  labels: FormLabels
  statusLabels: Dictionary["calendarPage"]["status"]
  projects: Project[]
  tasks: TrackedTask[]
  /** Leer, wenn die angezeigte Woche ganz in der Zukunft liegt. */
  bookableDays: Date[]
  startedTaskIds: ReadonlySet<string>
  /** Bereits gebuchte Minuten am gewählten Tag (ohne den bearbeiteten Eintrag). */
  otherMinutesOnDate: number
  onSubmit: (values: BookingFormValues) => Promise<void>
  onDelete: (entry: TimeBooking) => Promise<unknown>
}) {
  const { values, editing, change } = form
  const [submitting, setSubmitting] = useState(false)
  const errors = form.showErrors ? validateBooking(values) : {}
  const isFutureWeek = bookableDays.length === 0
  const disabled = isFutureWeek || submitting

  async function whileSubmitting(action: () => Promise<unknown>) {
    setSubmitting(true)
    try {
      await action()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const invalidField = firstInvalidField(validateBooking(values))
    if (invalidField) {
      form.setShowErrors(true)
      focusBookingField(invalidField)
      return
    }
    await whileSubmitting(() => onSubmit(values))
  }

  function selectProject(projectId: string | null) {
    if (projectId !== values.projectId) change({ projectId, taskId: null })
  }

  return (
    <Card className="p-5">
      <form
        id={BOOKING_FORM_ID}
        noValidate
        onSubmit={handleSubmit}
        // Abstand beim Hinscrollen, damit der sticky Seitenkopf das Formular nicht verdeckt.
        className="flex scroll-mt-32 flex-col gap-5"
      >
        <h2 className="text-lg font-semibold text-foreground">
          {editing ? labels.editTitle : labels.createTitle}
        </h2>

        {isFutureWeek && <FieldMessage tone="hint">{labels.futureWeek}</FieldMessage>}

        <ProjectField
          projects={projects}
          value={values.projectId}
          onChange={selectProject}
          invalid={Boolean(errors.project)}
          disabled={disabled}
          labels={labels}
        />
        <TaskField
          hasProject={values.projectId !== null}
          tasks={tasks.filter((task) => task.projectId === values.projectId)}
          value={values.taskId}
          onChange={(taskId) => change({ taskId })}
          startedTaskIds={startedTaskIds}
          invalid={Boolean(errors.task)}
          disabled={disabled}
          labels={labels}
          statusLabels={statusLabels}
        />
        <DateField
          value={values.date}
          onChange={(date) => change({ date })}
          bookableDays={bookableDays}
          disabled={disabled}
          labels={labels}
        />
        <DurationField
          value={values}
          onChange={change}
          error={errors.duration}
          otherMinutesOnDate={otherMinutesOnDate}
          disabled={disabled}
          labels={labels}
        />
        <DescriptionField
          value={values.description}
          onChange={(description) => change({ description })}
          invalid={Boolean(errors.description)}
          disabled={disabled}
          labels={labels}
        />
        <FormActions
          isEditing={editing !== null}
          durationLabel={formatDuration(durationMinutes(values))}
          disabled={disabled}
          onDelete={() => editing && whileSubmitting(() => onDelete(editing))}
          onReset={form.reset}
          labels={labels}
        />
      </form>
    </Card>
  )
}
