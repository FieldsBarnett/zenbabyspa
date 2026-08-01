import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { cronJobs } from "convex/server";

const crons = cronJobs();

crons.interval(
  "send appointment reminders",
  { hours: 1 },
  internal.crons.runReminders,
);

export const runReminders = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.runMutation(internal.booking.sendReminderEmails, {
      nowMs: Date.now(),
    });
    return null;
  },
});

export default crons;
