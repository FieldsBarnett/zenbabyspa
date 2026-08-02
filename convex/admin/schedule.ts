import { internal } from "../_generated/api";
import { v } from "convex/values";
import { adminMutation, adminQuery } from "../lib/customFunctions";

export const listAppointments = adminQuery({
  args: {
    fromMs: v.optional(v.number()),
    toMs: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("appointments"),
      startTime: v.number(),
      endTime: v.number(),
      status: v.union(v.literal("confirmed"), v.literal("cancelled")),
      customerNotes: v.optional(v.string()),
      adminNotes: v.optional(v.string()),
      customer: v.object({
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
      }),
      service: v.object({
        _id: v.id("services"),
        name: v.string(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    let appointments = await ctx.db
      .query("appointments")
      .withIndex("by_start_time")
      .order("asc")
      .collect();

    if (args.fromMs !== undefined) {
      appointments = appointments.filter((a) => a.startTime >= args.fromMs!);
    }
    if (args.toMs !== undefined) {
      appointments = appointments.filter((a) => a.startTime <= args.toMs!);
    }

    const enriched = [];
    for (const appointment of appointments) {
      const service = await ctx.db.get("services", appointment.serviceId);
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_auth_user", (q) => q.eq("authUserId", appointment.userId))
        .unique();

      if (!service || !profile) {
        continue;
      }

      enriched.push({
        _id: appointment._id,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        customerNotes: appointment.customerNotes,
        adminNotes: appointment.adminNotes,
        customer: {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
        },
        service: {
          _id: service._id,
          name: service.name,
        },
      });
    }

    return enriched;
  },
});

export const updateAppointment = adminMutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.optional(v.union(v.literal("confirmed"), v.literal("cancelled"))),
    adminNotes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get("appointments", args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const updates: {
      status?: "confirmed" | "cancelled";
      adminNotes?: string;
    } = {};

    if (args.status !== undefined) {
      updates.status = args.status;
    }
    if (args.adminNotes !== undefined) {
      updates.adminNotes = args.adminNotes;
    }

    await ctx.db.patch(args.appointmentId, updates);

    if (args.status === "cancelled" && appointment.status !== "cancelled") {
      await ctx.scheduler.runAfter(0, internal.booking.sendCancellationEmail, {
        appointmentId: args.appointmentId,
      });
    }

    return null;
  },
});

export const listAvailabilityRules = adminQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("availabilityRules"),
      dayOfWeek: v.number(),
      startTime: v.string(),
      endTime: v.string(),
      slotIntervalMinutes: v.number(),
      active: v.boolean(),
    }),
  ),
  handler: async (ctx) => {
    const rules = await ctx.db.query("availabilityRules").collect();
    return rules.map((rule) => ({
      _id: rule._id,
      dayOfWeek: rule.dayOfWeek,
      startTime: rule.startTime,
      endTime: rule.endTime,
      slotIntervalMinutes: rule.slotIntervalMinutes,
      active: rule.active,
    }));
  },
});

export const upsertAvailabilityRule = adminMutation({
  args: {
    ruleId: v.optional(v.id("availabilityRules")),
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    slotIntervalMinutes: v.number(),
    active: v.boolean(),
  },
  returns: v.id("availabilityRules"),
  handler: async (ctx, args) => {
    if (args.ruleId) {
      await ctx.db.patch(args.ruleId, {
        dayOfWeek: args.dayOfWeek,
        startTime: args.startTime,
        endTime: args.endTime,
        slotIntervalMinutes: args.slotIntervalMinutes,
        active: args.active,
      });
      return args.ruleId;
    }

    return await ctx.db.insert("availabilityRules", {
      dayOfWeek: args.dayOfWeek,
      startTime: args.startTime,
      endTime: args.endTime,
      slotIntervalMinutes: args.slotIntervalMinutes,
      active: args.active,
    });
  },
});

export const listBlockedTimes = adminQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("blockedTimes"),
      startTime: v.number(),
      endTime: v.number(),
      reason: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const blockedTimes = await ctx.db
      .query("blockedTimes")
      .order("desc")
      .collect();
    return blockedTimes.map((blocked) => ({
      _id: blocked._id,
      startTime: blocked.startTime,
      endTime: blocked.endTime,
      reason: blocked.reason,
    }));
  },
});

export const createBlockedTime = adminMutation({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    reason: v.string(),
  },
  returns: v.id("blockedTimes"),
  handler: async (ctx, args) => {
    if (args.endTime <= args.startTime) {
      throw new Error("End time must be after start time");
    }

    return await ctx.db.insert("blockedTimes", {
      startTime: args.startTime,
      endTime: args.endTime,
      reason: args.reason,
    });
  },
});

export const deleteBlockedTime = adminMutation({
  args: { blockedTimeId: v.id("blockedTimes") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.blockedTimeId);
    return null;
  },
});

function compareServicesByOrder<
  T extends { sortOrder?: number; _creationTime?: number; name: string },
>(a: T, b: T) {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  const createdA = a._creationTime ?? 0;
  const createdB = b._creationTime ?? 0;
  if (createdA !== createdB) {
    return createdA - createdB;
  }
  return a.name.localeCompare(b.name);
}

export const listServices = adminQuery({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("services"),
      name: v.string(),
      description: v.string(),
      durationMinutes: v.number(),
      priceCents: v.number(),
      imageUrl: v.optional(v.string()),
      active: v.boolean(),
      sortOrder: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const services = await ctx.db.query("services").collect();
    return [...services]
      .sort(compareServicesByOrder)
      .map((service) => ({
        _id: service._id,
        name: service.name,
        description: service.description,
        durationMinutes: service.durationMinutes,
        priceCents: service.priceCents,
        imageUrl: service.imageUrl,
        active: service.active,
        sortOrder: service.sortOrder,
      }));
  },
});

export const upsertService = adminMutation({
  args: {
    serviceId: v.optional(v.id("services")),
    name: v.string(),
    description: v.string(),
    durationMinutes: v.number(),
    priceCents: v.number(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
  },
  returns: v.id("services"),
  handler: async (ctx, args) => {
    if (args.serviceId) {
      const existing = await ctx.db.get("services", args.serviceId);
      if (!existing) {
        throw new Error("Service not found");
      }
      await ctx.db.patch(args.serviceId, {
        name: args.name,
        description: args.description,
        durationMinutes: args.durationMinutes,
        priceCents: args.priceCents,
        imageUrl: args.imageUrl ?? existing.imageUrl,
        active: args.active,
      });
      return args.serviceId;
    }

    const services = await ctx.db.query("services").collect();
    const maxSortOrder = services.reduce(
      (max, service) => Math.max(max, service.sortOrder ?? -1),
      -1,
    );

    return await ctx.db.insert("services", {
      name: args.name,
      description: args.description,
      durationMinutes: args.durationMinutes,
      priceCents: args.priceCents,
      imageUrl: args.imageUrl,
      active: args.active,
      sortOrder: maxSortOrder + 1,
    });
  },
});

export const deleteService = adminMutation({
  args: {
    serviceId: v.id("services"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const service = await ctx.db.get("services", args.serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    const appointment = await ctx.db
      .query("appointments")
      .withIndex("by_service", (q) => q.eq("serviceId", args.serviceId))
      .first();
    if (appointment) {
      throw new Error(
        "Cannot delete a service with existing appointments. Deactivate it instead.",
      );
    }

    await ctx.db.delete(args.serviceId);
    return null;
  },
});

export const reorderServices = adminMutation({
  args: {
    serviceIds: v.array(v.id("services")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const services = await ctx.db.query("services").collect();
    if (args.serviceIds.length !== services.length) {
      throw new Error("Service list is out of date. Refresh and try again.");
    }

    const serviceIdSet = new Set(services.map((service) => service._id));
    for (const serviceId of args.serviceIds) {
      if (!serviceIdSet.has(serviceId)) {
        throw new Error("Unknown service in reorder list");
      }
    }

    for (let index = 0; index < args.serviceIds.length; index++) {
      const serviceId = args.serviceIds[index]!;
      await ctx.db.patch(serviceId, { sortOrder: index });
    }

    return null;
  },
});
