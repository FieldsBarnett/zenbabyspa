import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const userRoleValidator = v.union(v.literal("customer"), v.literal("admin"));

export const appointmentStatusValidator = v.union(
  v.literal("confirmed"),
  v.literal("cancelled"),
);

export default defineSchema({
  services: defineTable({
    name: v.string(),
    description: v.string(),
    durationMinutes: v.number(),
    priceCents: v.number(),
    imageUrl: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_active", ["active"]),

  availabilityRules: defineTable({
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    slotIntervalMinutes: v.number(),
    active: v.boolean(),
  }).index("by_day_of_week", ["dayOfWeek"]),

  blockedTimes: defineTable({
    startTime: v.number(),
    endTime: v.number(),
    reason: v.string(),
  }).index("by_start_time", ["startTime"]),

  appointments: defineTable({
    userId: v.string(),
    serviceId: v.id("services"),
    startTime: v.number(),
    endTime: v.number(),
    status: appointmentStatusValidator,
    customerNotes: v.optional(v.string()),
    adminNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_start_time", ["startTime"])
    .index("by_status_and_start", ["status", "startTime"]),

  userProfiles: defineTable({
    authUserId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: userRoleValidator,
    adminNotes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user", ["authUserId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  emailTemplates: defineTable({
    key: v.string(),
    subject: v.string(),
    htmlBody: v.string(),
    textBody: v.string(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_key", ["key"]),
});
