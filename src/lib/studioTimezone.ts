export const STUDIO_TIMEZONE = "America/New_York";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function getZonedParts(dateMs: number, timeZone: string): ZonedParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(dateMs));

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Calendar date (YYYY-MM-DD) for a UTC timestamp in studio timezone. */
export function getStudioDateKey(dateMs = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateMs));
}

/** UTC ms for midnight at the start of a studio calendar date. */
export function getStudioDayStartMs(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const anchor = Date.UTC(year, month - 1, day, 12, 0, 0);
  const parts = getZonedParts(anchor, STUDIO_TIMEZONE);
  const msFromMidnight =
    parts.hour * 3_600_000 + parts.minute * 60_000 + parts.second * 1000;
  return anchor - msFromMidnight;
}

export function getStudioDayEndMs(dateKey: string): number {
  return getStudioDayStartMs(dateKey) + MS_PER_DAY - 1;
}

export function addStudioDays(dateKey: string, days: number): string {
  return getStudioDateKey(getStudioDayStartMs(dateKey) + days * MS_PER_DAY);
}

export function compareDateKeys(a: string, b: string): number {
  return a.localeCompare(b);
}

export function formatStudioDateTime(
  dateMs: number,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIMEZONE,
    ...options,
  }).format(new Date(dateMs));
}

export function formatStudioTime(dateMs: number): string {
  return formatStudioDateTime(dateMs, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatStudioAppointment(dateMs: number): string {
  const date = formatStudioDateTime(dateMs, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  return `${date} at ${formatStudioTime(dateMs)}`;
}

export function formatStudioAppointmentShort(dateMs: number): string {
  const date = formatStudioDateTime(dateMs, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return `${date} at ${formatStudioTime(dateMs)}`;
}

export function formatStudioDateLong(dateMs: number): string {
  return formatStudioDateTime(dateMs, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatStudioDateFull(dateMs: number): string {
  return formatStudioDateTime(dateMs, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatStudioDateMedium(dateMs: number): string {
  return formatStudioDateTime(dateMs, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatStudioDateShort(dateMs: number): string {
  return formatStudioDateTime(dateMs, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatStudioDateKeyDisplay(dateKey: string): string {
  return formatStudioDateTime(getStudioDayStartMs(dateKey), {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatStudioMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return formatStudioDateTime(Date.UTC(year, month - 1, 1, 12), {
    month: "long",
    year: "numeric",
  });
}

export function combineStudioDateAndTime(dateKey: string, time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const dayStart = getStudioDayStartMs(dateKey);
  return dayStart + ((hours ?? 0) * 60 + (minutes ?? 0)) * 60_000;
}

export function getStudioYearMonth(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function shiftStudioYearMonth(yearMonth: string, delta: number): string {
  const [yearStr, monthStr] = yearMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const totalMonths = year * 12 + (month - 1) + delta;
  const nextYear = Math.floor(totalMonths / 12);
  const nextMonth = (totalMonths % 12) + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}`;
}

export function getStudioDaysInMonth(yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function getStudioFirstWeekdayOfMonth(yearMonth: string): number {
  const [year, month] = yearMonth.split("-").map(Number);
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIMEZONE,
    weekday: "long",
  }).format(Date.UTC(year, month - 1, 1, 12));
  return WEEKDAY_TO_INDEX[weekday] ?? 0;
}

export function getStudioCalendarDays(
  yearMonth: string,
): Array<{ dateKey: string; day: number } | null> {
  const daysInMonth = getStudioDaysInMonth(yearMonth);
  const startWeekday = getStudioFirstWeekdayOfMonth(yearMonth);
  const cells: Array<{ dateKey: string; day: number } | null> = [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      dateKey: `${yearMonth}-${String(day).padStart(2, "0")}`,
      day,
    });
  }
  return cells;
}

export function isStudioToday(dateKey: string): boolean {
  return dateKey === getStudioDateKey();
}
