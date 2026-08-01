import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { ensureDefaultService } from "./lib/defaultService";
import { DEFAULT_EMAIL_TEMPLATES } from "./lib/emailTemplates";

export const seed = internalMutation({
  args: {
    adminEmail: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ensureDefaultService(ctx);

    const existingRules = await ctx.db.query("availabilityRules").first();
    if (!existingRules) {
      for (const dayOfWeek of [2, 3, 4, 5, 6]) {
        await ctx.db.insert("availabilityRules", {
          dayOfWeek,
          startTime: "09:00",
          endTime: "17:00",
          slotIntervalMinutes: 30,
          active: true,
        });
      }
    }

    for (const template of DEFAULT_EMAIL_TEMPLATES) {
      const existing = await ctx.db
        .query("emailTemplates")
        .withIndex("by_key", (q) => q.eq("key", template.key))
        .unique();
      if (!existing) {
        await ctx.db.insert("emailTemplates", {
          key: template.key,
          subject: template.subject,
          htmlBody: template.htmlBody,
          textBody: template.textBody,
          updatedAt: Date.now(),
        });
      }
    }

    if (args.adminEmail) {
      const profile = await ctx.db
        .query("userProfiles")
        .withIndex("by_email", (q) => q.eq("email", args.adminEmail!))
        .unique();
      if (profile) {
        await ctx.db.patch(profile._id, {
          role: "admin",
          updatedAt: Date.now(),
        });
      }
    }

    return null;
  },
});
