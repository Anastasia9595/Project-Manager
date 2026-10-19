import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@workspace/ui/components/button"

import { IconButton } from "@/components/shared/icon-button"
import { WeekPicker } from "@/components/time-tracking/week-picker"
import { navigateToWeek, useSelectedWeek } from "@/hooks/use-selected-week"
import { useToday } from "@/hooks/use-today"
import { getDictionary } from "@/i18n"
import { DAYS_PER_WEEK, addDays, isSameDay, startOfWeek } from "@/lib/week"

/** Wochennavigation im Seitenkopf: Zurück, Wochenlabel mit Datepicker, Vor, Heute. */
export function WeekNavigation({
  locale,
  initialWeek,
}: {
  locale?: string
  initialWeek: string | null
}) {
  const labels = getDictionary(locale).timeTrackingPage.weekNavigation
  const today = useToday()
  const weekStart = useSelectedWeek(initialWeek, today)
  const currentWeekStart = startOfWeek(today)

  return (
    <nav className="flex items-center gap-2" aria-label={labels.navigationLabel}>
      <IconButton
        icon={ArrowLeft01Icon}
        label={labels.previous}
        variant="outline"
        onClick={() => navigateToWeek(addDays(weekStart, -DAYS_PER_WEEK))}
      />
      <WeekPicker weekStart={weekStart} onSelectWeek={navigateToWeek} labels={labels} />
      <IconButton
        icon={ArrowRight01Icon}
        label={labels.next}
        variant="outline"
        onClick={() => navigateToWeek(addDays(weekStart, DAYS_PER_WEEK))}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isSameDay(weekStart, currentWeekStart)}
        onClick={() => navigateToWeek(currentWeekStart)}
      >
        {labels.today}
      </Button>
    </nav>
  )
}
