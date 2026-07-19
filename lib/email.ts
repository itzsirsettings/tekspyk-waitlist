import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import type { WaitlistEntry } from "@/lib/waitlist-store";

interface EmailLogEntry {
  to: string;
  subject: string;
  sentAt: string;
  provider: "smtp" | "local-ledger";
}

const EMAIL_LOG_PATH = path.join(process.cwd(), "data", "email-logs.jsonl");

async function appendEmailLog(entry: EmailLogEntry) {
  await mkdir(path.dirname(EMAIL_LOG_PATH), { recursive: true });
  await appendFile(EMAIL_LOG_PATH, `${JSON.stringify(entry)}\n`, "utf8");
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !password || !from) {
    return null;
  }

  return {
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: { user, password },
    from,
  };
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(config: NonNullable<ReturnType<typeof getSmtpConfig>>) {
  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.auth.user, pass: config.auth.password },
    });
  }
  return cachedTransporter;
}

async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const config = getSmtpConfig();

  if (config) {
    try {
      const transporter = getTransporter(config);
      await transporter.sendMail({
        from: config.from,
        to,
        subject,
        text,
      });
      await appendEmailLog({ to, subject, sentAt: new Date().toISOString(), provider: "smtp" });
      return;
    } catch (error) {
      console.error(`Failed to send email via SMTP to ${to}`, error);
    }
  }

  await appendEmailLog({ to, subject, sentAt: new Date().toISOString(), provider: "local-ledger" });
}

export async function sendWelcomeEmail(entry: WaitlistEntry) {
  const subject = "You are on the TekSpyk launch list";
  const text = `Hi ${entry.firstName},\n\nThanks for joining TekSpyk. We will be in touch with launch updates, early access opportunities, and curated learning resources.\n\nStay curious.\nThe TekSpyk team`;

  await sendEmail({ to: entry.email, subject, text });
}

export async function sendAdminNotification(entry: WaitlistEntry) {
  const recipient = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();

  if (!recipient) {
    return;
  }

  const subject = "New TekSpyk waitlist signup";
  const text = `A new person joined the TekSpyk waitlist.\n\nName: ${entry.firstName} ${entry.lastName}\nEmail: ${entry.email}\nCountry: ${entry.country}\nOccupation: ${entry.occupation}\nExperience: ${entry.experienceLevel}\nGoals: ${entry.learningGoals}\nCreated: ${entry.createdAt}\n\nYou can review all signups in the admin dashboard.`;

  await sendEmail({ to: recipient, subject, text });
}
