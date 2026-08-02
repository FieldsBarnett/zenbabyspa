export const STUDIO_TIMEZONE =
  process.env.STUDIO_TIMEZONE ?? "America/New_York";

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

function parseCalendarDateUtcNoon(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function getZonedDateKey(dateMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateMs));
}

export function getZonedDayStartMs(dateKey: string, timeZone: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  const anchor = Date.UTC(year, month - 1, day, 12, 0, 0);
  const parts = getZonedParts(anchor, timeZone);
  const msFromMidnight =
    parts.hour * 3_600_000 + parts.minute * 60_000 + parts.second * 1000;
  return anchor - msFromMidnight;
}

export function getZonedDayOfWeekFromDateKey(
  dateKey: string,
  timeZone: string,
): number {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
  }).format(parseCalendarDateUtcNoon(dateKey));
  return WEEKDAY_TO_INDEX[weekday] ?? 0;
}

export function isStudioReminderHour(nowMs: number): boolean {
  return getZonedParts(nowMs, STUDIO_TIMEZONE).hour === 8;
}

export function getTodayAndTomorrowBounds(nowMs: number, timeZone: string) {
  const todayKey = getZonedDateKey(nowMs, timeZone);
  const todayStart = getZonedDayStartMs(todayKey, timeZone);
  const todayEnd = todayStart + MS_PER_DAY;
  const tomorrowKey = getZonedDateKey(todayStart + MS_PER_DAY, timeZone);
  const tomorrowStart = getZonedDayStartMs(tomorrowKey, timeZone);
  const tomorrowEnd = tomorrowStart + MS_PER_DAY;

  return { todayStart, todayEnd, tomorrowStart, tomorrowEnd };
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** Start of the studio calendar day containing this UTC timestamp. */
export function getDayStartMs(dateMs: number): number {
  const dateKey = getZonedDateKey(dateMs, STUDIO_TIMEZONE);
  return getZonedDayStartMs(dateKey, STUDIO_TIMEZONE);
}

function formatInStudioTimezone(
  dateMs: number,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STUDIO_TIMEZONE,
    ...options,
  }).format(new Date(dateMs));
}

export function formatAppointmentDate(startTime: number): string {
  return formatInStudioTimezone(startTime, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatAppointmentTime(startTime: number): string {
  return formatInStudioTimezone(startTime, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotIntervalMinutes: number;
  active: boolean;
};

export type BlockedTime = {
  startTime: number;
  endTime: number;
};

export type ExistingAppointment = {
  startTime: number;
  endTime: number;
};

export function generateAvailableSlots(args: {
  dateKey: string;
  durationMinutes: number;
  rules: AvailabilityRule[];
  blockedTimes: BlockedTime[];
  appointments: ExistingAppointment[];
  nowMs: number;
}): number[] {
  const dayStart = getZonedDayStartMs(args.dateKey, STUDIO_TIMEZONE);
  const dayOfWeek = getZonedDayOfWeekFromDateKey(
    args.dateKey,
    STUDIO_TIMEZONE,
  );
  const activeRules = args.rules.filter(
    (rule) => rule.active && rule.dayOfWeek === dayOfWeek,
  );

  if (activeRules.length === 0) {
    return [];
  }

  const slots: number[] = [];

  for (const rule of activeRules) {
    const startMinutes = parseTimeToMinutes(rule.startTime);
    const endMinutes = parseTimeToMinutes(rule.endTime);

    for (
      let minute = startMinutes;
      minute + args.durationMinutes <= endMinutes;
      minute += rule.slotIntervalMinutes
    ) {
      const slotStart = dayStart + minute * 60_000;
      const slotEnd = slotStart + args.durationMinutes * 60_000;

      if (slotStart <= args.nowMs) {
        continue;
      }

      const blocked = args.blockedTimes.some(
        (block) => slotStart < block.endTime && slotEnd > block.startTime,
      );
      if (blocked) {
        continue;
      }

      const booked = args.appointments.some(
        (appointment) =>
          slotStart < appointment.endTime && slotEnd > appointment.startTime,
      );
      if (booked) {
        continue;
      }

      slots.push(slotStart);
    }
  }

  return [...new Set(slots)].sort((a, b) => a - b);
}
