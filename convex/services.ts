import { query } from "./_generated/server";
import { v } from "convex/values";

const serviceValidator = v.object({
  _id: v.id("services"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  durationMinutes: v.number(),
  priceCents: v.number(),
  imageUrl: v.optional(v.string()),
  active: v.boolean(),
  sortOrder: v.optional(v.number()),
});

function compareServicesByOrder<
  T extends { sortOrder?: number; _creationTime: number; name: string },
>(a: T, b: T) {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) {
    return orderA - orderB;
  }
  if (a._creationTime !== b._creationTime) {
    return a._creationTime - b._creationTime;
  }
  return a.name.localeCompare(b.name);
}

export const listPublic = query({
  args: {},
  returns: v.array(serviceValidator),
  handler: async (ctx) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    return services.sort(compareServicesByOrder);
  },
});

export const getPublic = query({
  args: { serviceId: v.id("services") },
  returns: v.union(serviceValidator, v.null()),
  handler: async (ctx, args) => {
    const service = await ctx.db.get("services", args.serviceId);
    if (!service?.active) {
      return null;
    }
    return service;
  },
});
