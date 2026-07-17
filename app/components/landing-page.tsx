"use client";

import {
  ArrowRight,
  Bot,
  ChevronDown,
  Cloud,
  Code2,
  Compass,
  Eye,
  GitBranch,
  Hammer,
  LineChart,
  Play,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TestTube2,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ComponentType, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { LogoMark } from "@/components/logo";

interface IconProps {
  className?: string;
}

interface ConceptProject {
  name: string;
  category: string;
  description: string;
  hue: string;
  clipId: string;
  icon: ComponentType<IconProps>;
}

const conceptProjects: ConceptProject[] = [
  { name: "AI Study Copilot", category: "AI Development", description: "A study assistant that explains, quizzes, and adapts to you.", hue: "oklch(93% 0.05 262)", clipId: "concept-ai-copilot", icon: Sparkles },
  { name: "Invoice Automation Agent", category: "AI Agents", description: "An agent that reads, files, and reconciles invoices on its own.", hue: "oklch(93% 0.05 160)", clipId: "concept-invoice-agent", icon: Bot },
  { name: "Fitness Tracker App", category: "Mobile Apps", description: "A mobile app that logs activity and visualizes progress.", hue: "oklch(93% 0.05 30)", clipId: "concept-fitness-tracker", icon: Smartphone },
  { name: "SaaS Analytics Dashboard", category: "SaaS Products", description: "A metrics dashboard built with real product architecture.", hue: "oklch(93% 0.05 300)", clipId: "concept-saas-dashboard", icon: LineChart },
  { name: "Support Chat Assistant", category: "AI Agents", description: "A support bot trained on your docs, deployed to production.", hue: "oklch(93% 0.05 220)", clipId: "concept-support-chat", icon: Workflow },
  { name: "Cloud Deploy Pipeline", category: "Cloud and DevOps", description: "A CI/CD pipeline that ships and monitors your build automatically.", hue: "oklch(93% 0.05 120)", clipId: "concept-cloud-deploy", icon: Cloud },
];

interface Track {
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  comingSoon?: boolean;
}

const tracks: Track[] = [
  { title: "AI Development", description: "Use modern AI models and prompt engineering to plan, build, and ship faster.", icon: Sparkles },
  { title: "Web Applications", description: "Build production web apps with the stacks real product teams use today.", icon: Code2 },
  { title: "Mobile Applications", description: "Take your products to iOS and Android with modern cross-platform tools.", icon: Smartphone },
  { title: "AI Agents and Automation", description: "Design agents and workflows that do real work while you sleep.", icon: Bot },
  { title: "Cloud and DevOps", description: "Deploy, scale, and operate systems with professional infrastructure discipline.", icon: Cloud },
  { title: "Security and Testing", description: "Ship with confidence using automated tests and secure engineering practice.", icon: ShieldCheck },
  { title: "Video and Image Generation", description: "Create media pipelines powered by generative AI models.", icon: Play, comingSoon: true },
];

interface LoopPhase {
  name: string;
  detail: string;
  icon: ComponentType<IconProps>;
  image: string;
}

const loopPhases: LoopPhase[] = [
  { name: "Plan", detail: "Turn an idea into a scoped product brief with AI as your planning partner.", icon: Compass, image: "/images/phases/plan.svg" },
  { name: "Design", detail: "Shape interfaces and architecture before a single line of code.", icon: Eye, image: "/images/phases/design.svg" },
  { name: "Code", detail: "Write real code with AI assistance and understand every line you ship.", icon: Code2, image: "/images/phases/code.svg" },
  { name: "Build", detail: "Assemble features into a working product with modern tooling.", icon: Hammer, image: "/images/phases/build.svg" },
  { name: "Test", detail: "Prove your product works with automated tests and quality gates.", icon: TestTube2, image: "/images/phases/test.svg" },
  { name: "Release", detail: "Cut clean releases with version control and review discipline.", icon: GitBranch, image: "/images/phases/release.svg" },
  { name: "Deploy", detail: "Push to real cloud infrastructure that serves real users.", icon: Rocket, image: "/images/phases/deploy.svg" },
  { name: "Operate", detail: "Run your product in production and handle what the real world throws at it.", icon: Cloud, image: "/images/phases/operate.svg" },
  { name: "Monitor", detail: "Watch performance, errors, and usage so you improve what matters.", icon: LineChart, image: "/images/phases/monitor.svg" },
];

const faqs = [
  {
    question: "Who is TekSpyk for?",
    answer:
      "Students, working professionals, founders, and career switchers who want to go from AI curiosity to real software engineering capability. If you want to build products, not just watch tutorials, this is for you.",
  },
  {
    question: "Do I need prior coding experience?",
    answer:
      "No. The curriculum starts from first principles and builds toward professional product delivery. Experienced developers can move faster through early modules.",
  },
  {
    question: "Will I build real applications?",
    answer:
      "Yes. Every phase of the curriculum is tied to a real build. You plan it, design it, code it, test it, deploy it, and monitor it in production.",
  },
  {
    question: "What exactly will I learn?",
    answer:
      "AI fundamentals, prompt engineering, programming, web and mobile development, SaaS products, AI agents, automation, DevOps, cloud, testing, security, product management, UI and UX, deployment, and monitoring.",
  },
  {
    question: "When does TekSpyk launch?",
    answer:
      "The founding cohort opens soon. Waitlist members get first access, launch updates, and early resources before public enrollment.",
  },
  {
    question: "What does joining the waitlist commit me to?",
    answer:
      "Nothing. Joining reserves your place and keeps you informed. You decide later whether to enroll when the doors open.",
  },
];

const avatarSeeds = [
  { initials: "KA", hue: "oklch(70% 0.14 262)" },
  { initials: "JO", hue: "oklch(70% 0.14 160)" },
  { initials: "MT", hue: "oklch(70% 0.14 30)" },
  { initials: "SN", hue: "oklch(70% 0.14 300)" },
  { initials: "DL", hue: "oklch(70% 0.14 220)" },
];

function ProjectCard({ project }: { project: ConceptProject }) {
  const Icon = project.icon;
  return (
    <article className="glow-border w-64 shrink-0 rounded-2xl border border-line bg-white p-3">
      <div
        className="relative flex h-36 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: project.hue }}
      >
        <video
          className="h-full w-full object-cover"
          src={`/videos/${project.clipId}.mp4`}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Abstract concept animation representing ${project.name}, an illustrative example, not a real product screenshot`}
        />
        <Icon className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 text-ink/30" aria-hidden="true" />
      </div>
      <div className="px-1 pb-1 pt-3">
        <p className="text-sm font-bold text-blue">{project.category}</p>
        <h3 className="mt-1 leading-snug">{project.name}</h3>
        <p className="mt-0.5 text-sm text-ink-soft">{project.description}</p>
      </div>
    </article>
  );
}

function PhaseList({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {loopPhases.map((item, index) => {
        const isActive = index === active;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(index)}
            aria-pressed={isActive}
            className={`group flex items-baseline gap-4 rounded-xl border-l-0 px-4 py-3 text-left transition-colors ${
              isActive ? "bg-surface" : "hover:bg-surface/60"
            }`}
          >
            <span
              className={`text-sm font-bold tabular-nums ${isActive ? "text-blue" : "text-ink-faint"}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1">
              <span className={`block text-lg font-bold ${isActive ? "text-blue" : "text-ink"}`}>
                {item.name}
              </span>
              <span
                className={`block overflow-hidden text-sm text-ink-soft transition-all duration-300 ${
                  isActive ? "mt-1 max-h-16 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {item.detail}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

type LoopPoint = { x: number; y: number };

function buildLoopPath(points: LoopPoint[], width: number, height: number) {
  if (points.length < 9 || width === 0 || height === 0) return "";
  const [p0, p1, p2, , , p5, , , p8] = points;
  const p3 = points[3];
  const p4 = points[4];
  const p6 = points[6];
  const p7 = points[7];
  const turn = Math.min(width, height) * 0.16;

  return [
    `M ${p0.x} ${p0.y}`,
    `L ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `Q ${p2.x + turn} ${(p2.y + p5.y) / 2} ${p5.x} ${p5.y}`,
    `L ${p4.x} ${p4.y}`,
    `L ${p3.x} ${p3.y}`,
    `Q ${p3.x - turn} ${(p3.y + p6.y) / 2} ${p6.x} ${p6.y}`,
    `L ${p7.x} ${p7.y}`,
    `L ${p8.x} ${p8.y}`,
    `C ${p8.x} ${p8.y + height * 0.26}, ${p0.x - width * 0.24} ${p0.y + height * 0.1}, ${p0.x} ${p0.y}`,
  ].join(" ");
}

function PhaseGrid({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [path, setPath] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const points = cellRefs.current.map((cell) => {
        if (!cell) return { x: 0, y: 0 };
        const rect = cell.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      setPath(buildLoopPath(points, containerRect.width, containerRect.height));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative px-2 pb-10">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="loop-connector-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--blue)" />
            <stop offset="33%" stopColor="var(--yellow)" />
            <stop offset="66%" stopColor="var(--red)" />
            <stop offset="100%" stopColor="var(--blue)" />
          </linearGradient>
        </defs>
        {path ? (
          <>
            <path
              d={path}
              fill="none"
              stroke="var(--line)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              id="loop-connector-path"
              d={path}
              fill="none"
              stroke="url(#loop-connector-gradient)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="16 12"
              className="loop-connector-flow"
            />
            {[0, 0.33, 0.66].map((offset) => (
              <circle key={offset} r={5} fill="var(--blue)" className="loop-connector-dot">
                <animateMotion dur="6s" begin={`${offset * -6}s`} repeatCount="indefinite">
                  <mpath href="#loop-connector-path" />
                </animateMotion>
              </circle>
            ))}
          </>
        ) : null}
      </svg>
      <div className="relative grid grid-cols-3 gap-4 sm:gap-6">
        {loopPhases.map((item, index) => {
          const isActive = index === active;
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              ref={(node) => {
                cellRefs.current[index] = node;
              }}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={isActive}
              aria-label={`${item.name}: ${item.detail}`}
              className={`glow-border relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-transform hover:-translate-y-0.5 ${
                isActive ? "border-blue ring-2 ring-blue ring-offset-2" : "border-line"
              }`}
            >
              <span className="relative block aspect-square w-full">
                <Image
                  src={item.image}
                  alt={`Illustration of the ${item.name} phase: ${item.detail}`}
                  fill
                  sizes="(min-width: 1024px) 20vw, 33vw"
                  className="object-cover"
                />
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-2">
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue" : "text-ink-faint"}`} aria-hidden="true" />
                <span className={`truncate text-xs font-bold ${isActive ? "text-blue" : "text-ink"}`}>
                  {item.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CurriculumSection() {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (pinned) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % loopPhases.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [pinned]);

  const handleSelect = (index: number) => {
    setActive(index);
    setPinned(true);
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
      <PhaseList active={active} onSelect={handleSelect} />
      <PhaseGrid active={active} onSelect={handleSelect} />
    </div>
  );
}

export function LandingPage() {
  const router = useRouter();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const goToOnboarding = (source: string) => {
    trackEvent("waitlist_cta_clicked", { source });
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("waitlist_cta_clicked", { source: "footer_newsletter" });
    const query = newsletterEmail.trim() ? `?email=${encodeURIComponent(newsletterEmail.trim())}` : "";
    router.push(`/onboarding${query}`);
  };

  const marqueeItems = [...conceptProjects, ...conceptProjects];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="inline-flex items-center">
            <LogoMark priority />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
            <a href="#projects" className="transition-colors hover:text-ink">Projects</a>
            <a href="#curriculum" className="transition-colors hover:text-ink">Curriculum</a>
            <a href="#tracks" className="transition-colors hover:text-ink">What You Learn</a>
            <a href="#faqs" className="transition-colors hover:text-ink">FAQs</a>
          </nav>
          <Link
            href="/onboarding"
            onClick={() => goToOnboarding("nav")}
            className="glow-border inline-flex items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-deep"
          >
            Join Waitlist
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="hero-wash">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-16 pt-16 text-center sm:pt-24">
            <p className="glow-border inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm shadow-[0_2px_14px_rgba(37,99,235,0.10)]">
              <span>
                New: <span className="font-semibold text-pink">Founding cohort</span> applications are open!
              </span>
              <Link
                href="/onboarding"
                onClick={() => goToOnboarding("announcement")}
                className="font-semibold text-blue transition-colors hover:text-blue-deep"
              >
                Join now <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </p>

            <h1 className="text-hero mt-8 text-[clamp(2.6rem,1.3rem+5vw,4.5rem)] leading-[1.05] tracking-[-0.03em]">
              Learn AI by Building Real Software
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-7 text-ink-soft sm:text-xl sm:leading-8">
              Master AI, programming, and software engineering while building production-ready applications.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                onClick={() => goToOnboarding("hero")}
                className="glow-border inline-flex items-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.30)] transition-all hover:-translate-y-0.5 hover:bg-blue-deep"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#curriculum"
                className="inline-flex items-center gap-2 text-base font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
                Watch Preview
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {avatarSeeds.map((avatar) => (
                  <span
                    key={avatar.initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white"
                    style={{ background: avatar.hue }}
                  >
                    {avatar.initials}
                  </span>
                ))}
              </div>
              <p className="text-sm text-ink-soft">Built for ambitious learners, wherever they are.</p>
            </div>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-heading" className="py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="projects-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                What You&apos;ll Be Able to Build
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                A preview of the kind of software the curriculum walks you through, from first commit to production.
              </p>
            </div>
          </div>
          <div className="marquee-shell relative mt-12 overflow-hidden" aria-label="Concept previews of software you'll learn to build, illustrative examples rather than real student work">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" aria-hidden="true" />
            <div className="marquee-track flex w-max gap-5 pr-5">
              {marqueeItems.map((project, index) => (
                <ProjectCard key={`${project.name}-${index}`} project={project} />
              ))}
            </div>
          </div>
        </section>

        <section id="tracks" aria-labelledby="tracks-heading" className="bg-surface py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="tracks-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                Everything You Need to Become an AI Engineer
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                One curriculum covering AI fundamentals, prompt engineering, product delivery, and the engineering discipline behind real software.
              </p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {tracks.map((track) => {
                const Icon = track.icon;
                return (
                  <article
                    key={track.title}
                    className="glow-border group rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="inline-flex rounded-xl bg-blue/10 p-2.5 text-blue">
                        <Icon className="h-5 w-5" />
                      </span>
                      {track.comingSoon ? (
                        <span className="rounded-full bg-surface-deep px-2.5 py-1 text-xs font-semibold text-ink-soft">
                          Coming Soon
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-4 text-lg">{track.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-ink-soft">{track.description}</p>
                    {track.comingSoon ? (
                      <p className="mt-4 text-sm font-semibold text-ink-faint">In a future release</p>
                    ) : (
                      <Link
                        href="/onboarding"
                        onClick={() => goToOnboarding(`track_${track.title}`)}
                        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue transition-colors hover:text-blue-deep"
                      >
                        Start learning
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="curriculum" aria-labelledby="curriculum-heading" className="py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="curriculum-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                One Loop. Nine Phases. Real Products.
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                TekSpyk teaches the complete product loop professional teams run every day. You will run it yourself, from planning to monitoring, on software you actually ship.
              </p>
            </div>
            <div className="mt-12">
              <CurriculumSection />
            </div>
          </div>
        </section>

        <section aria-labelledby="path-heading" className="bg-surface py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
            <div>
              <h2 id="path-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                Don&apos;t Know Where to Start? The Path Is Included.
              </h2>
              <p className="mt-3 max-w-lg text-lg text-ink-soft">
                You never have to guess what to learn next. The curriculum sequences every discipline into one path from beginner to shipping engineer.
              </p>
              <Link
                href="/onboarding"
                onClick={() => goToOnboarding("path")}
                className="glow-border mt-8 inline-flex items-center gap-2 rounded-xl bg-blue px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
              >
                Join the Waitlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <dl className="glow-border flex flex-col divide-y divide-line rounded-2xl border border-line bg-white px-6">
              {[
                { value: "16 disciplines", label: "From AI fundamentals to monitoring, every part of the craft." },
                { value: "9 phases", label: "The full product loop, practiced on real builds." },
                { value: "100% hands-on", label: "Every module ends with software you shipped yourself." },
              ].map((stat) => (
                <div key={stat.value} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-6">
                  <dt className="w-44 shrink-0 text-xl font-extrabold tracking-tight text-blue">{stat.value}</dt>
                  <dd className="text-ink-soft">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="faqs" aria-labelledby="faqs-heading" className="py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="faqs-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                Frequently Asked Questions
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                Everything you need to know about TekSpyk. Can&apos;t find your answer? Write to{" "}
                <a href="mailto:hello@tekspyk.com" className="font-semibold text-blue">hello@tekspyk.com</a>.
              </p>
            </div>
            <div className="mt-10 flex max-w-3xl flex-col gap-3">
              {faqs.map((faq) => (
                <details key={faq.question} className="faq glow-border group rounded-2xl border border-line bg-white px-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold">
                    {faq.question}
                    <ChevronDown className="faq-chevron h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                  </summary>
                  <p className="pb-5 leading-7 text-ink-soft">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="cta-heading" className="px-5 pb-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="glow-border mx-auto max-w-6xl rounded-3xl bg-ink px-6 py-14 text-center text-white sm:py-20">
            <p className="text-sm font-semibold text-white/60">TekSpyk</p>
            <h2 id="cta-heading" className="mt-3 text-[clamp(1.9rem,1.2rem+3vw,3.25rem)] tracking-[-0.02em]">
              Start Building Today!
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Join ambitious builders who are learning AI by shipping real software with TekSpyk.
            </p>
            <Link
              href="/onboarding"
              onClick={() => goToOnboarding("footer_cta")}
              className="glow-border mt-8 inline-flex items-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
            >
              Join the Waitlist
              <ArrowRight className="h-4 w-4" />
            </Link>

            <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-12 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-xl bg-white px-6 font-semibold text-ink transition-colors hover:bg-white/90"
              >
                Join
              </button>
            </form>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
              Get launch updates, learning resources, and early access opportunities. We start your signup with this email.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <LogoMark />
            <p className="mt-2 max-w-xs text-sm leading-6 text-ink-soft">
              The AI software engineering academy for people who learn by shipping.
            </p>
          </div>
          <nav aria-label="Quick navigation" className="text-sm">
            <p className="font-semibold">Quick Navigation</p>
            <ul className="mt-3 flex flex-col gap-2 text-ink-soft">
              <li><a href="#projects" className="transition-colors hover:text-ink">Projects</a></li>
              <li><a href="#curriculum" className="transition-colors hover:text-ink">Curriculum</a></li>
              <li><a href="#tracks" className="transition-colors hover:text-ink">What You Learn</a></li>
              <li><a href="#faqs" className="transition-colors hover:text-ink">FAQs</a></li>
            </ul>
          </nav>
          <nav aria-label="Contact and info" className="text-sm">
            <p className="font-semibold">Info</p>
            <ul className="mt-3 flex flex-col gap-2 text-ink-soft">
              <li>
                <Link href="/onboarding" onClick={() => goToOnboarding("footer_link")} className="transition-colors hover:text-ink">
                  Join the waitlist
                </Link>
              </li>
              <li><a href="mailto:hello@tekspyk.com" className="transition-colors hover:text-ink">hello@tekspyk.com</a></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-line py-5 text-center text-sm text-ink-faint">
          TekSpyk. All rights reserved. © 2026
        </div>
      </footer>
    </div>
  );
}
