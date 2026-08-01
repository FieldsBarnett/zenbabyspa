import { internal } from "./_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { authedMutation, authedQuery } from "./lib/customFunctions";
import { ensureCustomerByEmail } from "./lib/customers";
import {
  formatAppointmentDate,
  formatAppointmentTime,
  generateAvailableSlots,
  getDayStartMs,
} from "./lib/scheduling";
import { EMAIL_TEMPLATE_KEYS } from "./lib/emailTemplates";

export const getAvailableSlots = query({
  args: {
    serviceId: v.id("services"),
    dateMs: v.number(),
    nowMs: v.number(),
  },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const service = await ctx.db.get("services", args.serviceId);
    if (!service?.active) {
      return [];
    }

    const dayStart = getDayStartMs(args.dateMs);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const rules = await ctx.db.query("availabilityRules").collect();
    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .withIndex("by_start_time", (q) => q.gte("startTime", dayStart - 1))
      .collect();
    const dayBlocked = blockedTimes.filter(
      (block) => block.startTime < dayEnd && block.endTime > dayStart,
    );

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_status_and_start", (q) =>
        q.eq("status", "confirmed").gte("startTime", dayStart),
      )
      .collect();
    const dayAppointments = appointments.filter(
      (appointment) => appointment.startTime < dayEnd,
    );

    return generateAvailableSlots({
      dateMs: args.dateMs,
      durationMinutes: service.durationMinutes,
      rules,
      blockedTimes: dayBlocked,
      appointments: dayAppointments,
      nowMs: args.nowMs,
    });
  },
});

export const createAppointment = mutation({
  args: {
    serviceId: v.id("services"),
    startTime: v.number(),
    email: v.string(),
    name: v.optional(v.string()),
    customerNotes: v.optional(v.string()),
    nowMs: v.number(),
  },
  returns: v.id("appointments"),
  handler: async (ctx, args) => {
    const service = await ctx.db.get("services", args.serviceId);
    if (!service?.active) {
      throw new Error("Service not found");
    }

    const { authUserId } = await ensureCustomerByEmail(ctx, {
      email: args.email,
      name: args.name,
    });

    const dayStart = getDayStartMs(args.startTime);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const rules = await ctx.db.query("availabilityRules").collect();
    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .withIndex("by_start_time", (q) => q.gte("startTime", dayStart - 1))
      .collect();
    const dayBlocked = blockedTimes.filter(
      (block) => block.startTime < dayEnd && block.endTime > dayStart,
    );

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_status_and_start", (q) =>
        q.eq("status", "confirmed").gte("startTime", dayStart),
      )
      .collect();
    const dayAppointments = appointments.filter(
      (appointment) => appointment.startTime < dayEnd,
    );

    const slots = generateAvailableSlots({
      dateMs: args.startTime,
      durationMinutes: service.durationMinutes,
      rules,
      blockedTimes: dayBlocked,
      appointments: dayAppointments,
      nowMs: args.nowMs,
    });

    if (!slots.includes(args.startTime)) {
      throw new Error("Selected time slot is no longer available");
    }

    const endTime = args.startTime + service.durationMinutes * 60_000;

    const appointmentId = await ctx.db.insert("appointments", {
      userId: authUserId,
      serviceId: args.serviceId,
      startTime: args.startTime,
      endTime,
      status: "confirmed",
      customerNotes: args.customerNotes,
    });

    await ctx.scheduler.runAfter(0, internal.booking.sendConfirmationEmail, {
      appointmentId,
    });

    return appointmentId;
  },
});

export const listMyAppointments = authedQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("appointments"),
      startTime: v.number(),
      endTime: v.number(),
      status: v.union(v.literal("confirmed"), v.literal("cancelled")),
      customerNotes: v.optional(v.string()),
      service: v.object({
        _id: v.id("services"),
        name: v.string(),
        durationMinutes: v.number(),
        priceCents: v.number(),
      }),
    }),
  ),
  handler: async (ctx) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", ctx.authed.authUserId))
      .order("desc")
      .collect();

    const enriched = [];
    for (const appointment of appointments) {
      const service = await ctx.db.get("services", appointment.serviceId);
      if (!service) {
        continue;
      }
      enriched.push({
        _id: appointment._id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        customerNotes: appointment.customerNotes,
        service: {
          _id: service._id,
          name: service.name,
          durationMinutes: service.durationMinutes,
          priceCents: service.priceCents,
        },
      });
    }

    return enriched;
  },
});

export const cancelAppointment = authedMutation({
  args: { appointmentId: v.id("appointments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get("appointments", args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    if (appointment.userId !== ctx.authed.authUserId) {
      throw new Error("Unauthorized");
    }
    if (appointment.status === "cancelled") {
      return null;
    }

    await ctx.db.patch(args.appointmentId, { status: "cancelled" });
    await ctx.scheduler.runAfter(0, internal.booking.sendCancellationEmail, {
      appointmentId: args.appointmentId,
    });
    return null;
  },
});

export const getAvailableSlotsInternal = internalQuery({
  args: {
    serviceId: v.id("services"),
    dateMs: v.number(),
    nowMs: v.number(),
  },
  returns: v.array(v.number()),
  handler: async (ctx, args) => {
    const service = await ctx.db.get("services", args.serviceId);
    if (!service?.active) {
      return [];
    }

    const dayStart = getDayStartMs(args.dateMs);
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const rules = await ctx.db.query("availabilityRules").collect();
    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .withIndex("by_start_time", (q) => q.gte("startTime", dayStart - 1))
      .collect();
    const dayBlocked = blockedTimes.filter(
      (block) => block.startTime < dayEnd && block.endTime > dayStart,
    );

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_status_and_start", (q) =>
        q.eq("status", "confirmed").gte("startTime", dayStart),
      )
      .collect();
    const dayAppointments = appointments.filter(
      (appointment) => appointment.startTime < dayEnd,
    );

    return generateAvailableSlots({
      dateMs: args.dateMs,
      durationMinutes: service.durationMinutes,
      rules,
      blockedTimes: dayBlocked,
      appointments: dayAppointments,
      nowMs: args.nowMs,
    });
  },
});

async function loadAppointmentEmailContext(
  ctx: MutationCtx,
  appointmentId: Id<"appointments">,
) {
  const appointment = await ctx.db.get("appointments", appointmentId);
  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const service = await ctx.db.get("services", appointment.serviceId);
  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_auth_user", (q) => q.eq("authUserId", appointment.userId))
    .unique();

  if (!service || !profile) {
    throw new Error("Unable to load appointment email context");
  }

  return { appointment, service, profile };
}

export const sendConfirmationEmail = internalMutation({
  args: { appointmentId: v.id("appointments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { appointment, service, profile } = await loadAppointmentEmailContext(
      ctx,
      args.appointmentId,
    );

    await ctx.runMutation(internal.emails.sendTemplatedEmail, {
      to: profile.email,
      templateKey: EMAIL_TEMPLATE_KEYS.bookingConfirmation,
      variables: {
        customerName: profile.name,
        serviceName: service.name,
        appointmentDate: formatAppointmentDate(appointment.startTime),
        appointmentTime: formatAppointmentTime(appointment.startTime),
      },
    });

    return null;
  },
});

export const sendCancellationEmail = internalMutation({
  args: { appointmentId: v.id("appointments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { appointment, service, profile } = await loadAppointmentEmailContext(
      ctx,
      args.appointmentId,
    );

    await ctx.runMutation(internal.emails.sendTemplatedEmail, {
      to: profile.email,
      templateKey: EMAIL_TEMPLATE_KEYS.bookingCancellation,
      variables: {
        customerName: profile.name,
        serviceName: service.name,
        appointmentDate: formatAppointmentDate(appointment.startTime),
        appointmentTime: formatAppointmentTime(appointment.startTime),
      },
    });

    return null;
  },
});

export const sendReminderEmails = internalMutation({
  args: { nowMs: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const windowStart = args.nowMs + 23 * 60 * 60 * 1000;
    const windowEnd = args.nowMs + 25 * 60 * 60 * 1000;

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_status_and_start", (q) =>
        q.eq("status", "confirmed").gte("startTime", windowStart),
      )
      .collect();

    for (const appointment of appointments) {
      if (appointment.startTime > windowEnd) {
        continue;
      }

      const service = await ctx.db.get("services", appointment.serviceId);
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_auth_user", (q) => q.eq("authUserId", appointment.userId))
        .unique();

      if (!service || !profile) {
        continue;
      }

      await ctx.runMutation(internal.emails.sendTemplatedEmail, {
        to: profile.email,
        templateKey: EMAIL_TEMPLATE_KEYS.bookingReminder,
        variables: {
          customerName: profile.name,
          serviceName: service.name,
          appointmentDate: formatAppointmentDate(appointment.startTime),
          appointmentTime: formatAppointmentTime(appointment.startTime),
        },
      });
    }

    return null;
  },
});
