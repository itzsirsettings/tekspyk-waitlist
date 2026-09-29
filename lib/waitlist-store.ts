import { randomUUID } from "node:crypto";
import type { WaitlistSubmission } from "@/lib/waitlist-schema";
import { getDatabasePool } from "@/lib/database";
import { sendAdminNotification, sendWelcomeEmail } from "@/lib/email";

export interface WaitlistEntry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  occupation: string;
  experienceLevel: string;
  learningGoals: string;
  referralCode?: string;
  newsletter: boolean;
  adultConfirmed: boolean;
  termsAccepted: boolean;
  status: "pending" | "confirmed" | "waitlisted";
  createdAt: string;
  updatedAt: string;
}

export interface WaitlistStats {
  total: number;
  confirmed: number;
  pending: number;
  countries: Array<{ name: string; count: number }>;
  recentSignups: WaitlistEntry[];
}

interface WaitlistRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  occupation: string;
  experience_level: string;
  learning_goals: string;
  referral_code: string | null;
  newsletter: boolean;
  adult_confirmed: boolean;
  terms_accepted: boolean;
  status: WaitlistEntry["status"];
  created_at: Date;
  updated_at: Date;
}

const entryColumns = `
  id, first_name, last_name, email, phone, country, occupation,
  experience_level, learning_goals, referral_code, newsletter,
  adult_confirmed, terms_accepted, status, created_at, updated_at
`;

function toEntry(row: WaitlistRow): WaitlistEntry {
  const toISO = (val: unknown): string => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string" || typeof val === "number") return new Date(val).toISOString();
    throw new Error("Invalid waitlist timestamp");
  };

  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    country: row.country,
    occupation: row.occupation,
    experienceLevel: row.experience_level,
    learningGoals: row.learning_goals,
    referralCode: row.referral_code ?? undefined,
    newsletter: row.newsletter,
    adultConfirmed: row.adult_confirmed,
    termsAccepted: row.terms_accepted,
    status: row.status,
    createdAt: toISO(row.created_at),
    updatedAt: toISO(row.updated_at),
  };
}

export async function createWaitlistEntry(values: WaitlistSubmission) {
  const now = new Date().toISOString();
  const entry: WaitlistEntry = {
    id: randomUUID(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: values.phone.trim(),
    country: values.country.trim(),
    occupation: values.occupation.trim(),
    experienceLevel: values.experienceLevel.trim(),
    learningGoals: values.learningGoals.trim(),
    referralCode: values.referralCode?.trim() || undefined,
    newsletter: values.newsletter,
    adultConfirmed: values.adultConfirmed,
    termsAccepted: values.termsAccepted,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  try {
    await getDatabasePool().query(
      `INSERT INTO waitlist_entries (${entryColumns})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        entry.id,
        entry.firstName,
        entry.lastName,
        entry.email,
        entry.phone,
        entry.country,
        entry.occupation,
        entry.experienceLevel,
        entry.learningGoals,
        entry.referralCode ?? null,
        entry.newsletter,
        entry.adultConfirmed,
        entry.termsAccepted,
        entry.status,
        entry.createdAt,
        entry.updatedAt,
      ],
    );
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23505") {
      throw new Error("This email is already on the waitlist.");
    }
    throw error;
  }

  // The signup is already persisted. Email failures must not reject it.
  const emailResults = await Promise.allSettled([sendWelcomeEmail(entry), sendAdminNotification(entry)]);
  if (emailResults.some((result) => result.status === "rejected")) {
    console.error(JSON.stringify({ event: "waitlist_email_failed", entryId: entry.id }));
  }
  return entry;
}

export async function listWaitlistEntries() {
  const result = await getDatabasePool().query<WaitlistRow>(`SELECT ${entryColumns} FROM waitlist_entries ORDER BY created_at DESC`);
  return result.rows.map(toEntry);
}

export async function getWaitlistStats(): Promise<WaitlistStats> {
  const entries = await listWaitlistEntries();
  const countries = entries.reduce<Record<string, number>>((accumulator, entry) => {
    const key = entry.country || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return {
    total: entries.length,
    confirmed: entries.filter((entry) => entry.status === "confirmed").length,
    pending: entries.filter((entry) => entry.status !== "confirmed").length,
    countries: Object.entries(countries)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
    recentSignups: entries.slice(0, 6),
  };
}

function escapeCsv(value: string | boolean | undefined) {
  const text = String(value ?? "");
  const safe = /^[\s]*[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function exportWaitlistCsv() {
  const entries = await listWaitlistEntries();
  const headers = [
    "id", "firstName", "lastName", "email", "phone", "country", "occupation", "experienceLevel",
    "learningGoals", "referralCode", "newsletter", "adultConfirmed", "termsAccepted", "status", "createdAt",
  ];
  const rows = entries.map((entry) => [
    entry.id, entry.firstName, entry.lastName, entry.email, entry.phone, entry.country, entry.occupation,
    entry.experienceLevel, entry.learningGoals, entry.referralCode, entry.newsletter, entry.adultConfirmed, entry.termsAccepted,
    entry.status, entry.createdAt,
  ]);

  return [headers.join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
}
