import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";
import authConfig from "./auth.config";
import type { MutationCtx } from "./_generated/server";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: process.env.CONVEX_SITE_URL,
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    plugins: [
      crossDomain({ siteUrl }),
      convex({ authConfig }),
      magicLink({
        expiresIn: 600,
        sendMagicLink: async ({ email, url }) => {
          const mutationCtx = ctx as MutationCtx;
          await mutationCtx.scheduler.runAfter(
            0,
            internal.emails.sendTemplatedEmail,
            {
              to: email,
              templateKey: "magic_link",
              variables: {
                customerName: "",
                magicLinkUrl: url,
              },
            },
          );
        },
      }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  returns: v.union(
    v.object({
      authUserId: v.string(),
      email: v.string(),
      name: v.string(),
      role: v.union(v.literal("customer"), v.literal("admin")),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    // safeGetAuthUser returns null when logged out; getAuthUser throws and
    // breaks public pages that call this query from the site chrome.
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return null;
    }

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
      .unique();

    if (!profile) {
      return null;
    }

    return {
      authUserId: authUser._id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
    };
  },
});
