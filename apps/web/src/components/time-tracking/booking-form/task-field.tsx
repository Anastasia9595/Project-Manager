import { ERROR_ID, FIELD_ID } from "@/components/time-tracking/booking-form/booking-form-fields"
import { FieldMessage } from "@/components/time-tracking/booking-form/field-message"
import {
  FieldSet,
  RequiredMark,
  type FormLabels,
} from "@/components/time-tracking/booking-form/form-layout"
import { TaskRadioList } from "@/components/time-tracking/booking-form/task-radio-list"
import type { Dictionary } from "@/i18n"
import type { TrackedTask } from "@/models/task"

/** Aufgaben des gewählten Projekts; Hinweise ohne Projekt, ohne Aufgaben oder bei abgeschlossener Aufgabe. */
export function TaskField({
  hasProject,
  tasks,
  value,
  onChange,
  startedTaskIds,
  invalid,
  disabled,
  labels,
  statusLabels,
}: {
  hasProject: boolean
  /** Aufgaben des gewählten Projekts. */
  tasks: TrackedTask[]
  value: string | null
  onChange: (taskId: string) => void
  startedTaskIds: ReadonlySet<string>
  invalid: boolean
  disabled: boolean
  labels: FormLabels
  statusLabels: Dictionary["calendarPage"]["status"]
}) {
  const selectedTask = tasks.find((task) => task.id === value)

  return (
    <FieldSet
      legend={
        <>
          {labels.task}
          <RequiredMark label={labels.required} />
        </>
      }
      describedBy={invalid ? ERROR_ID.task : undefined}
    >
      {!hasProject ? (
        <FieldMessage tone="hint">{labels.selectProjectFirst}</FieldMessage>
      ) : tasks.length === 0 ? (
        <FieldMessage tone="hint">{labels.noTasks}</FieldMessage>
      ) : (
        <TaskRadioList
          name={FIELD_ID.task}
          tasks={tasks}
          value={value}
          onChange={onChange}
          startedTaskIds={startedTaskIds}
          statusLabels={statusLabels}
          disabled={disabled}
        />
      )}
      {selectedTask?.done && <FieldMessage tone="warning">{labels.taskDone}</FieldMessage>}
      {invalid && (
        <FieldMessage id={ERROR_ID.task} tone="error">
          {labels.validation.task}
        </FieldMessage>
      )}
    </FieldSet>
  )
}
