"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, ChevronDown, BookOpen, Clock3, Layers3 } from "lucide-react";
import { AI_PHASES } from "@/lib/curriculum-data";
import { CT_THREE_MONTH, CT_SIX_MONTH } from "@/lib/computer-training-data";
import { explainTopic, topicSubtopics } from "@/lib/curriculum-explanations";

type TrackId = "ai" | "ct3" | "ct6";
type Unit = { id: string; title: string; context: string; topics: string[]; art: number; atlas: "ai" | "digital" };
const aiUnits: Unit[] = AI_PHASES.map((phase, index) => ({ id: phase.id, title: phase.name, context: phase.detail, topics: phase.topics, art: index, atlas: "ai" }));
const computerUnits = (months: typeof CT_THREE_MONTH): Unit[] => months.flatMap((month, monthIndex) => month.weeks.map((week, weekIndex) => ({ id: week.id, title: week.title.replace(/^Week\s+\d+:\s*/i, ""), context: month.title.replace(/^Month\s+\d+\s*[–-]\s*/i, ""), topics: week.topics, art: (monthIndex * 4 + weekIndex) % 9, atlas: "digital" })));
const TRACKS: Record<TrackId, { label: string; subject: string; description: string; units: Unit[] }> = {
  ai: { label: "AI engineering", subject: "AI & software", description: "Follow the path from a useful product idea to a responsible, observed release.", units: aiUnits },
  ct3: { label: "Computer skills · 3 months", subject: "Digital foundations", description: "A focused route through computer basics, office tools, online work, design, and web fundamentals.", units: computerUnits(CT_THREE_MONTH) },
  ct6: { label: "Computer skills · 6 months", subject: "Digital skills", description: "A comprehensive path from ICT foundations through office productivity, design, web development, AI, and a capstone.", units: computerUnits(CT_SIX_MONTH) },
};

function AtlasArt({ index, label, description, atlas }: { index: number; label: string; description: string; atlas: Unit["atlas"] }) {
  const positions = ["0% 0%", "50% 0%", "100% 0%", "0% 50%", "50% 50%", "100% 50%", "0% 100%", "50% 100%", "100% 100%"];
  const image = atlas === "ai" ? "/images/curriculum-risograph-atlas.webp" : "/images/digital-skills-risograph-atlas.webp";
  return <div role="img" aria-label={`${label}: ${description}`} className="curriculum-atlas-art" style={{ backgroundImage: `url('${image}')`, backgroundPosition: positions[index % 9] }} />;
}

export function CurriculumCanvas() {
  const [active, setActive] = useState<TrackId>("ai");
  const [query, setQuery] = useState("");
  const track = TRACKS[active];
  const normalized = query.trim().toLowerCase();
  const units = useMemo(() => normalized ? track.units.map((unit) => ({ ...unit, topics: unit.title.toLowerCase().includes(normalized) ? unit.topics : unit.topics.filter((topic) => `${topic} ${explainTopic(topic, unit.context)}`.toLowerCase().includes(normalized)) })).filter((unit) => unit.title.toLowerCase().includes(normalized) || unit.topics.length) : track.units, [track, normalized]);
  const topicCount = track.units.reduce((count, unit) => count + unit.topics.length, 0);

  return <div className="curriculum-canvas">
    <section className="curriculum-canvas-hero">
      <div><p className="curriculum-overline">A map for learning by doing</p><h1>Every skill has a next step.</h1><p className="curriculum-canvas-lead">Explore the topics, see what each one means, and follow a practical path through the curriculum.</p></div>
      <Image src={active === "ai" ? "/images/curriculum-risograph-atlas.webp" : "/images/digital-skills-risograph-atlas.webp"} width={1254} height={1254} alt={active === "ai" ? "Risograph illustrations of the AI product lifecycle, from planning through monitoring." : "Risograph illustrations for computer basics, files, documents, spreadsheets, presentations, online work, security, design, and web development."} className="curriculum-hero-art" />
    </section>
    <div className="curriculum-track-tabs" role="group" aria-label="Curriculum paths">{(Object.entries(TRACKS) as [TrackId, typeof track][]).map(([id, item]) => <button type="button" aria-pressed={active === id} key={id} onClick={() => setActive(id)}>{item.label}</button>)}</div>
    <section aria-labelledby="active-track-title">
      <div className="curriculum-track-heading"><div><p className="curriculum-overline">{track.subject}</p><h2 id="active-track-title">{track.label}</h2><p>{track.description}</p></div><div className="curriculum-stat-row"><span><Layers3 size={17} aria-hidden="true" /> {track.units.length} units</span><span><BookOpen size={17} aria-hidden="true" /> {topicCount} topics</span></div></div>
      <label className="curriculum-search"><Search size={19} aria-hidden="true" /><span className="sr-only">Search this curriculum</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a skill or topic" /></label>
      {units.length ? <div className="curriculum-unit-list">{units.map((unit, index) => <section className="curriculum-unit" key={unit.id}>
        <div className="curriculum-unit-top"><span className="curriculum-unit-number">{String(index + 1).padStart(2, "0")}</span><div><h3>{unit.title}</h3><p>{unit.topics.length} topics · concepts, guided practice, real tasks</p></div><Clock3 size={18} aria-hidden="true" /></div>
        <div className="curriculum-topic-grid">{unit.topics.map((topic) => {
          const description = explainTopic(topic, unit.context);
          return <details className="curriculum-topic" key={`${unit.id}:${topic}`}><summary><AtlasArt index={unit.art} label={topic} description={description} atlas={unit.atlas} /><span><strong>{topic}</strong><small>What it is and how to use it</small></span><ChevronDown size={18} aria-hidden="true" /></summary><div className="curriculum-topic-detail"><p>{description}</p><ol>{topicSubtopics(topic, unit.context, description).map((subtopic) => <li key={subtopic.title}><strong>{subtopic.title}</strong><span>{subtopic.detail}</span></li>)}</ol></div></details>;
        })}</div>
      </section>)}</div> : <p className="curriculum-no-results">No topics match that search. Try another term.</p>}
    </section>
  </div>;
}
