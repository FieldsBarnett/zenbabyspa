import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BookingCalendarProps = {
  selectedDateMs: number;
  onSelectDate: (dateMs: number) => void;
  minDateMs: number;
  maxDateMs: number;
};

function startOfDayMs(dateMs: number) {
  const date = new Date(dateMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function BookingCalendar({
  selectedDateMs,
  onSelectDate,
  minDateMs,
  maxDateMs,
}: BookingCalendarProps) {
  const minDay = startOfDayMs(minDateMs);
  const maxDay = startOfDayMs(maxDateMs);
  const selectedDay = startOfDayMs(selectedDateMs);

  const [visibleMonthMs, setVisibleMonthMs] = useState(() =>
    startOfMonth(selectedDay).getTime(),
  );

  const visibleMonth = new Date(visibleMonthMs);
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days = useMemo(
    () =>
      eachDayOfInterval({ start: gridStart, end: gridEnd }).map((day) => ({
        dateMs: startOfDayMs(day.getTime()),
        inMonth: isSameMonth(day, visibleMonth),
      })),
    [gridEnd, gridStart, visibleMonth],
  );

  const canGoPrev = startOfMonth(subMonths(visibleMonth, 1)).getTime() >= startOfMonth(minDay).getTime();
  const canGoNext = startOfMonth(addMonths(visibleMonth, 1)).getTime() <= startOfMonth(maxDay).getTime();

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoPrev}
          onClick={() => setVisibleMonthMs(startOfMonth(subMonths(visibleMonth, 1)).getTime())}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <p className="font-medium">{format(visibleMonth, "MMMM yyyy")}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={!canGoNext}
          onClick={() => setVisibleMonthMs(startOfMonth(addMonths(visibleMonth, 1)).getTime())}
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
        {days.map(({ dateMs, inMonth }) => {
          const isSelected = isSameDay(dateMs, selectedDay);
          const isDisabled =
            !inMonth ||
            isBefore(dateMs, minDay) ||
            isAfter(dateMs, maxDay);

          return (
            <button
              key={dateMs}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate(dateMs)}
              className={cn(
                "flex h-10 w-full items-center justify-center rounded-md text-sm transition",
                !inMonth && "text-muted-foreground/40",
                inMonth && !isDisabled && "hover:bg-accent",
                isToday(dateMs) && !isSelected && "font-semibold text-primary",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                isDisabled && "cursor-not-allowed opacity-40",
              )}
              aria-label={format(dateMs, "EEEE, MMMM d, yyyy")}
              aria-pressed={isSelected}
            >
              {format(dateMs, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
