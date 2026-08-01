import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";
import { authedMutation } from "./lib/customFunctions";

export const syncProfile = authedMutation({
  args: {
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.id("userProfiles"),
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
      .unique();

    const email = authUser.email ?? existing?.email ?? "";
    const name =
      args.name ??
      authUser.name ??
      existing?.name ??
      email.split("@")[0] ??
      "Guest";
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        phone: args.phone ?? existing.phone,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("userProfiles", {
      authUserId: authUser._id,
      email,
      name,
      phone: args.phone,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const ensureProfileOnAuth = mutation({
  args: {},
  returns: v.union(v.id("userProfiles"), v.null()),
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (existing) {
      return existing._id;
    }

    const email = authUser.email ?? "";
    const name = authUser.name ?? email.split("@")[0] ?? "Guest";
    const now = Date.now();

    return await ctx.db.insert("userProfiles", {
      authUserId: authUser._id,
      email,
      name,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getMyProfile = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("userProfiles"),
      authUserId: v.string(),
      email: v.string(),
      name: v.string(),
      phone: v.optional(v.string()),
      role: v.union(v.literal("customer"), v.literal("admin")),
      adminNotes: v.optional(v.string()),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
      .unique();
  },
});
