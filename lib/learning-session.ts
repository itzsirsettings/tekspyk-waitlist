import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { HttpError } from "@/lib/http";

export type LearningUser = { id: string; name: string; email: string; role: string };

export async function currentLearningUser(): Promise<LearningUser | null> {
  const session = await getAuth().api.getSession({ headers: await headers() });
  if (!session || !session.user.emailVerified) return null;
  return { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role };
}

export async function requireLearningUser() {
  const user = await currentLearningUser();
  if (!user) throw new HttpError(401, "Please sign in to continue.");
  return user;
}

export function requireTeacher(user: LearningUser) {
  if (user.role !== "teacher" && user.role !== "admin") throw new HttpError(403, "Teacher access is required.");
}
