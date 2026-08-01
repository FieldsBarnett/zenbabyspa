import { components } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthUserDoc = {
  _id: string;
  email: string;
  name: string;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function defaultNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim();
  return local && local.length > 0 ? local : "Guest";
}

/**
 * Find or create a Better Auth user + app profile for a booking email.
 * Existing accounts are matched by email; new emails get an account automatically.
 */
export async function ensureCustomerByEmail(
  ctx: MutationCtx,
  args: { email: string; name?: string },
): Promise<{ authUserId: string; profile: Doc<"userProfiles"> }> {
  const email = normalizeEmail(args.email);
  if (!EMAIL_RE.test(email)) {
    throw new Error("Please enter a valid email address");
  }

  const providedName = args.name?.trim();
  const fallbackName = providedName || defaultNameFromEmail(email);
  const now = Date.now();

  let authUser = (await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    where: [
      {
        field: "email",
        value: email,
        mode: "insensitive",
      },
    ],
  })) as AuthUserDoc | null;

  if (!authUser) {
    authUser = (await ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          email,
          name: fallbackName,
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      },
    })) as AuthUserDoc;
  }

  let profile = await ctx.db
    .query("userProfiles")
    .withIndex("by_auth_user", (q) => q.eq("authUserId", authUser._id))
    .unique();

  if (!profile) {
    const profileByEmail = await ctx.db
      .query("userProfiles")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (profileByEmail) {
      // Prefer the auth user we resolved; keep their profile linked for bookings.
      if (profileByEmail.authUserId !== authUser._id) {
        await ctx.db.patch(profileByEmail._id, {
          authUserId: authUser._id,
          email,
          name: providedName || profileByEmail.name,
          updatedAt: now,
        });
        profile = await ctx.db.get("userProfiles", profileByEmail._id);
      } else {
        profile = profileByEmail;
      }
    }
  }

  if (!profile) {
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: authUser._id,
      email,
      name: fallbackName,
      role: "customer",
      createdAt: now,
      updatedAt: now,
    });
    profile = await ctx.db.get("userProfiles", profileId);
  } else if (providedName && providedName !== profile.name) {
    await ctx.db.patch(profile._id, {
      name: providedName,
      email,
      updatedAt: now,
    });
    profile = await ctx.db.get("userProfiles", profile._id);
  } else if (profile.email !== email) {
    await ctx.db.patch(profile._id, {
      email,
      updatedAt: now,
    });
    profile = await ctx.db.get("userProfiles", profile._id);
  }

  if (!profile) {
    throw new Error("Unable to create customer profile");
  }

  return { authUserId: authUser._id, profile };
}
