import { query } from "./_generated/server";
import { v } from "convex/values";
import { DEFAULT_SERVICE } from "./lib/defaultService";

const serviceValidator = v.object({
  _id: v.id("services"),
  _creationTime: v.number(),
  name: v.string(),
  description: v.string(),
  durationMinutes: v.number(),
  priceCents: v.number(),
  imageUrl: v.optional(v.string()),
  active: v.boolean(),
});

export const listPublic = query({
  args: {},
  returns: v.array(serviceValidator),
  handler: async (ctx) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();

    if (services.length <= 1) {
      return services;
    }

    const canonical =
      services.find((service) => service.name === DEFAULT_SERVICE.name) ??
      services[0];

    return canonical ? [canonical] : [];
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
