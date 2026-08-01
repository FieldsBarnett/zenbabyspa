import { format } from "date-fns";

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function getDayStartMs(dateMs: number): number {
  const date = new Date(dateMs);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function formatAppointmentDate(startTime: number): string {
  return format(new Date(startTime), "EEEE, MMMM d, yyyy");
}

export function formatAppointmentTime(startTime: number): string {
  return format(new Date(startTime), "h:mm a");
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
  dateMs: number;
  durationMinutes: number;
  rules: AvailabilityRule[];
  blockedTimes: BlockedTime[];
  appointments: ExistingAppointment[];
  nowMs: number;
}): number[] {
  const dayStart = getDayStartMs(args.dateMs);
  const dayOfWeek = new Date(dayStart).getDay();
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
