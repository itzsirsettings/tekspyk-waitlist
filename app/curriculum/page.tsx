import type { Metadata } from "next";
import Link from "next/link";
import { CurriculumCanvas } from "@/components/curriculum-canvas";

export const metadata: Metadata = { title: "Explore the curriculum", description: "Browse digital skills and AI learning paths, with topic explanations and practical next steps." };

export default function CurriculumPage() {
  return <main className="curriculum-page"><Link className="curriculum-wordmark" href="/">TekSpyk<span>.</span></Link><CurriculumCanvas /><footer className="curriculum-footer"><span>TekSpyk Learning</span><a href="mailto:hello@tekspyk.com">Questions? Contact the learning team</a></footer></main>;
}
