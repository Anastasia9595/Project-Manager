import { useMemo } from "react"
import { Toaster } from "@workspace/ui/components/sonner"

import { BookingForm } from "@/components/time-tracking/booking-form/booking-form"
import { revealBookingForm } from "@/components/time-tracking/booking-form/booking-form-fields"
import { WeekOverviewCard } from "@/components/time-tracking/week-overview/week-overview-card"
import type { CellTarget } from "@/components/time-tracking/week-overview/types"
import { WeekStatusCard } from "@/components/time-tracking/week-status-card"
import { DUMMY_PROJECTS } from "@/dummy-data/projects"
import { DUMMY_TRACKED_TASKS } from "@/dummy-data/tracked-tasks"
import { useBookingActions } from "@/hooks/use-booking-actions"
import { useBookingForm } from "@/hooks/use-booking-form"
import { useSelectedWeek } from "@/hooks/use-selected-week"
import { useStartedTaskIds } from "@/hooks/use-started-task-ids"
import { useToday } from "@/hooks/use-today"
import { useWeekBookings } from "@/hooks/use-week-bookings"
import { useWeekOverview } from "@/hooks/use-week-overview"
import { getDictionary } from "@/i18n"
import { getIsoWeek } from "@/lib/calendar/calendar-view"
import { getDefaultBookingDate, isBookableDay } from "@/lib/time-tracking/bookable-days"
import {
  entriesWithin,
  minutesOnDayExcept,
  progressPercent,
  sumMinutes,
} from "@/lib/time-tracking/calculations/totals"
import { buildWeekCsv, weekCsvFileName } from "@/lib/time-tracking/csv-export"
import { getWorkweekDays, parseDayKey, toDayKey } from "@/lib/week"
import type { Project } from "@/models/project"
import type { TrackedTask } from "@/models/task"
import type { TimeBooking } from "@/models/time-booking"
import { downloadCsvFile } from "@/utils/download-file"

// Daten kommen per Props (Default: Dummy-Daten). Für Directus Projekte und Aufgaben
// auf `Project`/`TrackedTask` mappen; Zeitbuchungen laufen über das Repository.
export function TimeTrackingWorkspace({
  locale,
  initialWeek,
  userId,
  projects = DUMMY_PROJECTS,
  tasks = DUMMY_TRACKED_TASKS,
}: {
  locale?: string
  initialWeek: string | null
  userId: string
  projects?: Project[]
  tasks?: TrackedTask[]
}) {
  const dictionary = getDictionary(locale)
  const labels = dictionary.timeTrackingPage
  const today = useToday()
  const weekStart = useSelectedWeek(initialWeek, today)
  const workdays = useMemo(() => getWorkweekDays(weekStart), [weekStart])

  const bookings = useWeekBookings(userId, weekStart, today)
  const startedTaskIds = useStartedTaskIds(tasks, bookings.bookedTaskIds)
  const overview = useWeekOverview({
    entries: bookings.entries,
    projects,
    tasks,
    workdays,
    today,
  })
  const form = useBookingForm(
    toDayKey(getDefaultBookingDate(workdays, today)),
    toDayKey(weekStart)
  )
  const actions = useBookingActions({ bookings, form, userId, labels: labels.toast })

  function addFromCell({ projectId, taskId, date }: CellTarget) {
    form.prefill({ projectId, taskId, date: toDayKey(date) })
    revealBookingForm()
  }

  function editBooking(entry: TimeBooking) {
    form.startEdit(entry)
    revealBookingForm()
  }

  function exportWeek() {
    downloadCsvFile(
      weekCsvFileName(weekStart),
      // Wie Tabelle und Summen: nur Mo-Fr.
      buildWeekCsv(entriesWithin(bookings.entries, workdays), projects, tasks, labels.csv)
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <WeekStatusCard
        weekNumber={getIsoWeek(weekStart)}
        actualMinutes={overview.totals.week}
        targetMinutes={overview.totals.weekTarget}
        percent={progressPercent(overview.totals.week, overview.totals.weekTarget)}
        todayMinutes={sumMinutes(bookings.todayEntries)}
        todayCount={bookings.todayEntries.length}
        labels={labels.status}
      />
      <BookingForm
        form={form}
        labels={labels.form}
        statusLabels={dictionary.calendarPage.status}
        projects={projects}
        tasks={tasks}
        bookableDays={workdays.filter((day) => isBookableDay(day, today))}
        startedTaskIds={startedTaskIds}
        otherMinutesOnDate={minutesOnDayExcept(
          bookings.entries,
          parseDayKey(form.values.date),
          form.editing?.id
        )}
        onSubmit={actions.submitBooking}
        onDelete={actions.deleteBooking}
      />
      <WeekOverviewCard
        loaded={bookings.loaded}
        onExport={exportWeek}
        groups={overview.groups}
        days={workdays}
        today={today}
        entries={bookings.entries}
        totals={overview.totals}
        sort={overview.sort}
        onSort={overview.sortBy}
        labels={labels.overview}
        popoverLabels={labels.popover}
        onAdd={addFromCell}
        onEdit={editBooking}
        onDelete={actions.deleteBooking}
      />
      <Toaster position="bottom-right" />
    </div>
  )
}
