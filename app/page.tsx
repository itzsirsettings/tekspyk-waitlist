import { LandingPage } from "@/components/landing-page";
import Link from "next/link";
import { getCurriculumTopicStates } from "@/lib/curriculum-store";
import type { CurriculumTopicState } from "@/lib/curriculum-store";

export default async function Home() {
  let topicStates: Record<string, CurriculumTopicState> = {};
  try {
    const stateMap = await getCurriculumTopicStates();
    topicStates = Object.fromEntries(stateMap);
  } catch {
    console.error(JSON.stringify({ event: "public_curriculum_unavailable" }));
    return <main className="learning-main"><h1>We’re updating the curriculum</h1><p>The curriculum is temporarily unavailable. Please try again shortly.</p><Link href="/learn">Open your learning workspace</Link></main>;
  }
  return <LandingPage topicStates={topicStates} />;
}
