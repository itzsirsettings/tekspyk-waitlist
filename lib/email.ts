import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type { WaitlistEntry } from "@/lib/waitlist-store";

let cachedTransporter: Transporter | undefined;

function smtpConfiguration() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;
  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !from) {
    throw new Error("SMTP is not configured");
  }
  const localTest = process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(host);
  return { host, port, user, pass, from, localTest };
}

export async function sendTransactionalEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const config = smtpConfiguration();
  cachedTransporter ??= nodemailer.createTransport({
    host: config.host, port: config.port, secure: config.port === 465,
    requireTLS: !config.localTest && config.port !== 465,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 15_000,
  });
  await cachedTransporter.sendMail({ from: config.from, to, subject, text });
}

export async function sendWelcomeEmail(entry: WaitlistEntry) {
  await sendTransactionalEmail({
    to: entry.email, subject: "You are on the TekSpyk launch list",
    text: `Hi ${entry.firstName},\n\nThanks for joining TekSpyk. We will be in touch with launch updates and early access opportunities.\n\nThe TekSpyk team`,
  });
}

export async function sendAdminNotification(_entry: WaitlistEntry) {
  void _entry;
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (!recipient) return;
  await sendTransactionalEmail({
    to: recipient, subject: "New TekSpyk waitlist signup",
    text: "A new person joined the TekSpyk waitlist. Sign in to the admin dashboard to review the signup.",
  });
}
