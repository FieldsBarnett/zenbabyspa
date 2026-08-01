import { v } from "convex/values";
import { adminMutation, adminQuery } from "../lib/customFunctions";

export const listCustomers = adminQuery({
  args: {
    search: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("userProfiles"),
      authUserId: v.string(),
      name: v.string(),
      email: v.string(),
      phone: v.optional(v.string()),
      role: v.union(v.literal("customer"), v.literal("admin")),
      adminNotes: v.optional(v.string()),
      createdAt: v.number(),
      appointmentCount: v.number(),
      lastAppointmentAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").order("desc").collect();
    const search = args.search?.trim().toLowerCase();

    const customers = [];
    for (const profile of profiles) {
      if (
        search &&
        !profile.name.toLowerCase().includes(search) &&
        !profile.email.toLowerCase().includes(search)
      ) {
        continue;
      }

      const appointments = await ctx.db
        .query("appointments")
        .withIndex("by_user", (q) => q.eq("userId", profile.authUserId))
        .collect();

      customers.push({
        _id: profile._id,
        authUserId: profile.authUserId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        adminNotes: profile.adminNotes,
        createdAt: profile.createdAt,
        appointmentCount: appointments.length,
        lastAppointmentAt: appointments.reduce<number | undefined>(
          (latest, appointment) =>
            latest === undefined || appointment.startTime > latest
              ? appointment.startTime
              : latest,
          undefined,
        ),
      });
    }

    return customers;
  },
});

export const getCustomer = adminQuery({
  args: { profileId: v.id("userProfiles") },
  returns: v.union(
    v.object({
      profile: v.object({
        _id: v.id("userProfiles"),
        authUserId: v.string(),
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        role: v.union(v.literal("customer"), v.literal("admin")),
        adminNotes: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      appointments: v.array(
        v.object({
          _id: v.id("appointments"),
          startTime: v.number(),
          endTime: v.number(),
          status: v.union(v.literal("confirmed"), v.literal("cancelled")),
          serviceName: v.string(),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get("userProfiles", args.profileId);
    if (!profile) {
      return null;
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", profile.authUserId))
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
        serviceName: service.name,
      });
    }

    return {
      profile: {
        _id: profile._id,
        authUserId: profile.authUserId,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        adminNotes: profile.adminNotes,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
      appointments: enriched,
    };
  },
});

export const updateCustomerNotes = adminMutation({
  args: {
    profileId: v.id("userProfiles"),
    adminNotes: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const profile = await ctx.db.get("userProfiles", args.profileId);
    if (!profile) {
      throw new Error("Customer not found");
    }

    await ctx.db.patch(args.profileId, {
      adminNotes: args.adminNotes,
      phone: args.phone ?? profile.phone,
      updatedAt: Date.now(),
    });

    return null;
  },
});
