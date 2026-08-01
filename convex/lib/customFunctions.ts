import {
  customMutation,
  customQuery,
} from "convex-helpers/server/customFunctions";
import { mutation, query } from "../_generated/server";
import { authComponent } from "../auth";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type AuthedCtx = {
  authUserId: string;
  email: string;
  name: string;
  profile: Doc<"userProfiles">;
};

async function getAuthedContext(
  ctx: QueryCtx | MutationCtx,
  createIfMissing = false,
): Promise<AuthedCtx> {
  const authUser = await authComponent.getAuthUser(ctx);
  if (!authUser) {
    throw new Error("Not authenticated");
  }

  let profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
    .unique();

  if (!profile && createIfMissing) {
    const mutationCtx = ctx as MutationCtx;
    const email = authUser.email ?? "";
    const name = authUser.name ?? email.split("@")[0] ?? "Guest";
    const now = Date.now();
    const profileId = await mutationCtx.db.insert("userProfiles", {
      authUserId: authUser._id,
      email,
      name,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });
    profile = await mutationCtx.db.get("userProfiles", profileId);
  }

  if (!profile) {
    throw new Error("User profile not found");
  }

  return {
    authUserId: authUser._id,
    email: profile.email,
    name: profile.name,
    profile,
  };
}

async function getAdminContext(ctx: QueryCtx | MutationCtx): Promise<AuthedCtx> {
  const authed = await getAuthedContext(ctx);
  if (authed.profile.role !== "admin") {
    throw new Error("Admin access required");
  }
  return authed;
}

export const authedQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const authed = await getAuthedContext(ctx);
    return {
      ctx: { ...ctx, authed },
      args,
    };
  },
});

export const authedMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const authed = await getAuthedContext(ctx, true);
    return {
      ctx: { ...ctx, authed },
      args,
    };
  },
});

export const adminQuery = customQuery(query, {
  args: {},
  input: async (ctx, args) => {
    const authed = await getAdminContext(ctx);
    return {
      ctx: { ...ctx, authed },
      args,
    };
  },
});

export const adminMutation = customMutation(mutation, {
  args: {},
  input: async (ctx, args) => {
    const authed = await getAdminContext(ctx);
    return {
      ctx: { ...ctx, authed },
      args,
    };
  },
});
