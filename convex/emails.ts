import { components, internal } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import {
  DEFAULT_EMAIL_TEMPLATES,
  renderTemplate,
  type TemplateVariables,
} from "./lib/emailTemplates";

export const resend = new Resend(components.resend, {
  testMode: process.env.RESEND_TEST_MODE !== "false",
});

const defaultFrom =
  process.env.EMAIL_FROM ?? "Zen Baby Studio <onboarding@resend.dev>";

export const getRenderedTemplate = internalQuery({
  args: {
    key: v.string(),
    variables: v.record(v.string(), v.string()),
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

    const subject = stored?.subject ?? fallback?.subject;
    const htmlBody = stored?.htmlBody ?? fallback?.htmlBody;
    const textBody = stored?.textBody ?? fallback?.textBody;

    if (!subject || !htmlBody || !textBody) {
      throw new Error(`Email template not found: ${args.key}`);
    }

    const variables = args.variables as TemplateVariables;

    return {
      subject: renderTemplate(subject, variables),
      html: renderTemplate(htmlBody, variables),
      text: renderTemplate(textBody, variables),
    };
  },
});

export const sendTemplatedEmail = internalMutation({
  args: {
    to: v.string(),
    templateKey: v.string(),
    variables: v.record(v.string(), v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const rendered = await ctx.runQuery(internal.emails.getRenderedTemplate, {
      key: args.templateKey,
      variables: args.variables,
    });

    await resend.sendEmail(ctx, {
      from: defaultFrom,
      to: args.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    return null;
  },
});
