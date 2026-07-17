import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { WaitlistSubmission } from "@/lib/waitlist-schema";
import { sendWelcomeEmail } from "@/lib/email";

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

interface StorePayload {
  entries: WaitlistEntry[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");

async function ensureStore() {
  await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, JSON.stringify({ entries: [] }, null, 2));
  }
}

async function readStore(): Promise<StorePayload> {
  await ensureStore();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as StorePayload;
}

async function writeStore(store: StorePayload) {
  await ensureStore();
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2));
}

export async function createWaitlistEntry(values: WaitlistSubmission) {
  const store = await readStore();
  const normalizedEmail = values.email.trim().toLowerCase();
  const existing = store.entries.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (existing) {
    throw new Error("This email is already on the waitlist.");
  }

  const now = new Date().toISOString();
  const entry: WaitlistEntry = {
    id: randomUUID(),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: normalizedEmail,
    phone: values.phone.trim(),
    country: values.country.trim(),
    occupation: values.occupation.trim(),
    experienceLevel: values.experienceLevel.trim(),
    learningGoals: values.learningGoals.trim(),
    referralCode: values.referralCode?.trim() || undefined,
    newsletter: values.newsletter,
    termsAccepted: values.termsAccepted,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  store.entries = [entry, ...store.entries];
  await writeStore(store);
  await sendWelcomeEmail(entry);
  return entry;
}

export async function listWaitlistEntries() {
  const store = await readStore();
  return store.entries.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
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

export async function exportWaitlistCsv() {
  const entries = await listWaitlistEntries();
  const headers = ["id", "name", "email", "country", "occupation", "experienceLevel", "status", "createdAt"];
  const rows = entries.map((entry) => [
    entry.id,
    `${entry.firstName} ${entry.lastName}`,
    entry.email,
    entry.country,
    entry.occupation,
    entry.experienceLevel,
    entry.status,
    entry.createdAt,
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  return csv;
}
