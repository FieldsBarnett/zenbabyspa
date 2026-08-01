import { v } from "convex/values";
import { adminMutation, adminQuery } from "../lib/customFunctions";
import {
  DEFAULT_EMAIL_TEMPLATES,
  renderTemplate,
} from "../lib/emailTemplates";

export const listEmailTemplates = adminQuery({
  args: {},
  returns: v.array(
    v.object({
      key: v.string(),
      subject: v.string(),
      htmlBody: v.string(),
      textBody: v.string(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    }),
  ),
  handler: async (ctx) => {
    const stored = await ctx.db.query("emailTemplates").collect();
    const storedKeys = new Set(stored.map((template) => template.key));
    const now = Date.now();

    const defaults = DEFAULT_EMAIL_TEMPLATES.filter(
      (template) => !storedKeys.has(template.key),
    ).map((template) => ({
      key: template.key,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      updatedAt: now,
      updatedBy: undefined,
    }));

    return [
      ...stored.map((template) => ({
        key: template.key,
        subject: template.subject,
        htmlBody: template.htmlBody,
        textBody: template.textBody,
        updatedAt: template.updatedAt,
        updatedBy: template.updatedBy,
      })),
      ...defaults,
    ];
  },
});

export const getEmailTemplate = adminQuery({
  args: { key: v.string() },
  returns: v.union(
    v.object({
      key: v.string(),
      subject: v.string(),
      htmlBody: v.string(),
      textBody: v.string(),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const stored = await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (stored) {
      return {
        key: stored.key,
        subject: stored.subject,
        htmlBody: stored.htmlBody,
        textBody: stored.textBody,
        updatedAt: stored.updatedAt,
        updatedBy: stored.updatedBy,
      };
    }

    const fallback = DEFAULT_EMAIL_TEMPLATES.find(
      (template) => template.key === args.key,
    );
    if (!fallback) {
      return null;
    }

    return {
      key: fallback.key,
      subject: fallback.subject,
      htmlBody: fallback.htmlBody,
      textBody: fallback.textBody,
      updatedAt: Date.now(),
      updatedBy: undefined,
    };
  },
});

export const updateEmailTemplate = adminMutation({
  args: {
    key: v.string(),
    subject: v.string(),
    htmlBody: v.string(),
    textBody: v.string(),
  },
  returns: v.id("emailTemplates"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();
    const updatedBy = ctx.authed.email;

    if (existing) {
      await ctx.db.patch(existing._id, {
        subject: args.subject,
        htmlBody: args.htmlBody,
        textBody: args.textBody,
        updatedAt: now,
        updatedBy,
      });
      return existing._id;
    }

    return await ctx.db.insert("emailTemplates", {
      key: args.key,
      subject: args.subject,
      htmlBody: args.htmlBody,
      textBody: args.textBody,
      updatedAt: now,
      updatedBy,
    });
  },
});

export const previewEmailTemplate = adminQuery({
  args: {
    key: v.string(),
    subject: v.optional(v.string()),
    htmlBody: v.optional(v.string()),
    textBody: v.optional(v.string()),
  },
  returns: v.object({
    subject: v.string(),
    html: v.string(),
    text: v.string(),
  }),
  handler: async (ctx, args) => {
    const stored = await ctx.db
      .query("emailTemplates")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const fallback = DEFAULT_EMAIL_TEMPLATES.find(
      (template) => template.key === args.key,
    );

    const subject = args.subject ?? stored?.subject ?? fallback?.subject ?? "";
    const htmlBody =
      args.htmlBody ?? stored?.htmlBody ?? fallback?.htmlBody ?? "";
    const textBody =
      args.textBody ?? stored?.textBody ?? fallback?.textBody ?? "";

    const sampleVariables = {
      customerName: "Alex",
      customerEmail: "alex@example.com",
      serviceName: "45-Minute Hydrotherapy & Bonding Massage",
      appointmentDate: "Tuesday, March 12, 2026",
      appointmentTime: "10:30 AM",
      customerNotes: "First visit — baby is 6 months old.",
      reminderWhen: "tomorrow",
      magicLinkUrl: "https://zenbabystudio.com/auth/verify?token=sample",
    };

    return {
      subject: renderTemplate(subject, sampleVariables),
      html: renderTemplate(htmlBody, sampleVariables),
      text: renderTemplate(textBody, sampleVariables),
    };
  },
});
