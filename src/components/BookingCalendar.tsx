import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  compareDateKeys,
  formatStudioDateKeyDisplay,
  formatStudioMonthLabel,
  getStudioCalendarDays,
  getStudioYearMonth,
  isStudioToday,
  shiftStudioYearMonth,
} from "@/lib/studioTimezone";

type BookingCalendarProps = {
  selectedDateKey: string;
  onSelectDateKey: (dateKey: string) => void;
  minDateKey: string;
  maxDateKey: string;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingCalendar({
  selectedDateKey,
  onSelectDateKey,
  minDateKey,
  maxDateKey,
}: BookingCalendarProps) {
  const [viewYearMonth, setViewYearMonth] = useState(() =>
    getStudioYearMonth(selectedDateKey),
  );

  const calendarDays = useMemo(
    () => getStudioCalendarDays(viewYearMonth),
    [viewYearMonth],
  );

  const minYearMonth = getStudioYearMonth(minDateKey);
  const maxYearMonth = getStudioYearMonth(maxDateKey);
  const canGoPrev = viewYearMonth > minYearMonth;
  const canGoNext = viewYearMonth < maxYearMonth;

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoPrev}
          onClick={() => setViewYearMonth((current) => shiftStudioYearMonth(current, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-medium">{formatStudioMonthLabel(viewYearMonth)}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoNext}
          onClick={() => setViewYearMonth((current) => shiftStudioYearMonth(current, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarDays.map((cell, index) => {
          if (!cell) {
            return <div key={`empty-${index}`} className="h-10" />;
          }

          const isSelected = selectedDateKey === cell.dateKey;
          const isDisabled =
            compareDateKeys(cell.dateKey, minDateKey) < 0 ||
            compareDateKeys(cell.dateKey, maxDateKey) > 0;
          const isToday = isStudioToday(cell.dateKey);

          return (
            <button
              key={cell.dateKey}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDateKey(cell.dateKey)}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-md text-sm transition",
                !isDisabled && "hover:bg-accent",
                isToday && !isSelected && "font-semibold text-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isDisabled && "cursor-not-allowed opacity-40",
              )}
              aria-label={formatStudioDateKeyDisplay(cell.dateKey)}
              aria-pressed={isSelected}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        All times shown in Eastern Time.
      </p>
    </div>
  );
}
