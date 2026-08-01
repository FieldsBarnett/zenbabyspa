import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { cronJobs } from "convex/server";
import { isStudioReminderHour } from "./lib/scheduling";

const crons = cronJobs();

// Convex crons use UTC; check hourly and send only at 8 AM studio local time.
crons.cron(
  "send appointment reminders",
  "0 * * * *",
  internal.crons.runReminders,
);

export const runReminders = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const nowMs = Date.now();
    if (!isStudioReminderHour(nowMs)) {
      return null;
    }

    await ctx.runMutation(internal.booking.sendReminderEmails, {
      nowMs,
    });
    return null;
  },
});

export default crons;
