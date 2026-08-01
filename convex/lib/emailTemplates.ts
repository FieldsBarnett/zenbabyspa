export const EMAIL_TEMPLATE_KEYS = {
  magicLink: "magic_link",
  bookingConfirmation: "booking_confirmation",
  bookingStudioNotification: "booking_studio_notification",
  bookingReminder: "booking_reminder",
  bookingCancellation: "booking_cancellation",
} as const;

export type EmailTemplateKey =
  (typeof EMAIL_TEMPLATE_KEYS)[keyof typeof EMAIL_TEMPLATE_KEYS];

export type TemplateVariables = Record<string, string>;

export function renderTemplate(
  template: string,
  variables: TemplateVariables,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return variables[key] ?? "";
  });
}

export const DEFAULT_EMAIL_TEMPLATES: Array<{
  key: EmailTemplateKey;
  subject: string;
  htmlBody: string;
  textBody: string;
}> = [
  {
    key: EMAIL_TEMPLATE_KEYS.magicLink,
    subject: "Your Zen Baby Studio sign-in link",
    htmlBody: `<p>Hello{{customerName}},</p><p>Click the link below to sign in to Zen Baby Studio:</p><p><a href="{{magicLinkUrl}}">Sign in</a></p><p>This link expires in 10 minutes.</p>`,
    textBody:
      "Hello{{customerName}},\n\nSign in to Zen Baby Studio: {{magicLinkUrl}}\n\nThis link expires in 10 minutes.",
  },
  {
    key: EMAIL_TEMPLATE_KEYS.bookingConfirmation,
    subject: "Your Zen Baby Studio appointment is confirmed",
    htmlBody: `<p>Hi {{customerName}},</p><p>Your {{serviceName}} appointment is confirmed for {{appointmentDate}} at {{appointmentTime}}.</p><p>We look forward to seeing you at Zen Baby Studio.</p>`,
    textBody:
      "Hi {{customerName}},\n\nYour {{serviceName}} appointment is confirmed for {{appointmentDate}} at {{appointmentTime}}.\n\nWe look forward to seeing you at Zen Baby Studio.",
  },
  {
    key: EMAIL_TEMPLATE_KEYS.bookingStudioNotification,
    subject: "New booking: {{customerName}} — {{appointmentDate}}",
    htmlBody: `<p>A new appointment was booked.</p><ul><li><strong>Customer:</strong> {{customerName}} ({{customerEmail}})</li><li><strong>Service:</strong> {{serviceName}}</li><li><strong>When:</strong> {{appointmentDate}} at {{appointmentTime}}</li><li><strong>Notes:</strong> {{customerNotes}}</li></ul>`,
    textBody:
      "New appointment booked.\n\nCustomer: {{customerName}} ({{customerEmail}})\nService: {{serviceName}}\nWhen: {{appointmentDate}} at {{appointmentTime}}\nNotes: {{customerNotes}}",
  },
  {
    key: EMAIL_TEMPLATE_KEYS.bookingReminder,
    subject: "Reminder: your Zen Baby Studio appointment {{reminderWhen}}",
    htmlBody: `<p>Hi {{customerName}},</p><p>This is a reminder that your {{serviceName}} appointment is {{reminderWhen}} on {{appointmentDate}} at {{appointmentTime}}.</p>`,
    textBody:
      "Hi {{customerName}},\n\nReminder: your {{serviceName}} appointment is {{reminderWhen}} on {{appointmentDate}} at {{appointmentTime}}.",
  },
  {
    key: EMAIL_TEMPLATE_KEYS.bookingCancellation,
    subject: "Your Zen Baby Studio appointment was cancelled",
    htmlBody: `<p>Hi {{customerName}},</p><p>Your {{serviceName}} appointment on {{appointmentDate}} at {{appointmentTime}} has been cancelled.</p>`,
    textBody:
      "Hi {{customerName}},\n\nYour {{serviceName}} appointment on {{appointmentDate}} at {{appointmentTime}} has been cancelled.",
  },
];
