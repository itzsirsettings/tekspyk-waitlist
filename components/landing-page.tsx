"use client";

import {
  ArrowRight,
  Bot,
  ChevronDown,
  Cloud,
  Code2,
  LineChart,
  Play,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type ComponentType, type FormEvent, type FocusEvent } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { LogoMark } from "@/components/logo";
import { CurriculumExplorer } from "@/components/curriculum-explorer";
import { ComputerTrainingExplorer } from "@/components/computer-training-explorer";
import type { CurriculumTopicState } from "@/lib/curriculum-store";

interface LandingPageProps {
  topicStates?: Record<string, CurriculumTopicState>;
}

const HERO_SLIDE_INTERVAL_MS = 6000;
const heroSlides = [
  {
    heading: "Learn AI by Building Real Software",
    description: "Master AI, programming, and software engineering while building production-ready applications.",
  },
  {
    heading: "Turn curiosity into things that work.",
    description: "One TekSpyk profile connects your classes, builds, and progress in a focused workspace made for software learners.",
  },
  {
    heading: "Learn by doing, not just watching.",
    description: "Practice through lessons, assignments, and projects across AI engineering and computer training.",
  },
  {
    heading: "Choose your path. Build at your pace.",
    description: "Explore self-paced AI software lessons or TekSpyk’s structured 3-month and 6-month Computer Training programs.",
  },
  {
    heading: "Put every lesson into practice.",
    description: "Complete practical assignments and projects as you develop skills in software, digital productivity, and more.",
  },
  {
    heading: "See how far\nyou’ve come.",
    description: "Track your classes, completed lessons, assignments, feedback, and grades in one focused workspace.",
  },
];

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
    question: "How do I register my interest?",
    answer:
      "Complete the short registration form. It records your learning interests and contact details so the TekSpyk team can review your request.",
  },
  {
    question: "Does this form create a learner account?",
    answer:
      "No. This form submits a registration request; it does not create a learner account or enroll you in a class.",
  },
];

const learnerAvatars = [
  "/avatars/learner-01.webp",
  "/avatars/learner-02.webp",
  "/avatars/learner-03.webp",
  "/avatars/learner-04.webp",
  "/avatars/learner-05.webp",
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

export function LandingPage({ topicStates = {} }: LandingPageProps) {
  const router = useRouter();
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [isHeroFocused, setIsHeroFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (isHeroHovered || isHeroFocused || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      setHeroSlideIndex((index) => (index + 1) % heroSlides.length);
    }, HERO_SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isHeroHovered, isHeroFocused, prefersReducedMotion]);

  const handleHeroBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsHeroFocused(false);
    }
  };

  const goToOnboarding = (source: string) => {
    trackEvent("registration_cta_clicked", { source });
  };

  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    trackEvent("registration_cta_clicked", { source: "footer_registration" });
    const query = registrationEmail.trim() ? `?email=${encodeURIComponent(registrationEmail.trim())}` : "";
    router.push(`/onboarding${query}`);
  };

  const marqueeItems = [...conceptProjects, ...conceptProjects];

  return (
    <div className="min-h-screen bg-bg text-ink">
      <a href="#main-content" className="sr-only z-50 rounded bg-white p-3 text-blue focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="inline-flex items-center">
            <LogoMark priority />
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
            <a href="#projects" className="transition-colors hover:text-ink">Projects</a>
            <a href="#programs" className="transition-colors hover:text-ink">Programs</a>
            <a href="#curriculum" className="transition-colors hover:text-ink">Curriculum</a>
            <a href="#tracks" className="transition-colors hover:text-ink">What You Learn</a>
            <a href="#faqs" className="transition-colors hover:text-ink">FAQs</a>
          </nav>
          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-line px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">
              Menu
            </summary>
            <nav aria-label="Mobile navigation" className="absolute right-0 top-12 z-50 flex w-56 flex-col gap-1 rounded-xl border border-line bg-white p-2 text-sm shadow-lg">
              <a className="rounded-lg px-3 py-2 hover:bg-surface" href="#projects">Projects</a>
              <a className="rounded-lg px-3 py-2 hover:bg-surface" href="#programs">Programs</a>
              <a className="rounded-lg px-3 py-2 hover:bg-surface" href="#curriculum">Curriculum</a>
              <a className="rounded-lg px-3 py-2 hover:bg-surface" href="#tracks">What You Learn</a>
              <a className="rounded-lg px-3 py-2 hover:bg-surface" href="#faqs">FAQs</a>
            </nav>
          </details>
          <Link
            href="/learn"
            className="glow-border inline-flex items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-deep"
          >
            Learning portal
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="hero-wash">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-5 pb-16 pt-16 text-center sm:pt-24">
            <p className="glow-border inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm shadow-[0_2px_14px_rgba(37,99,235,0.10)]">
              <span>
                Explore TekSpyk programs and submit a registration request.
              </span>
              <Link
                href="/onboarding"
                onClick={() => goToOnboarding("announcement")}
                className="font-semibold text-blue transition-colors hover:text-blue-deep"
              >
                Register <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </p>

            <div
              role="region"
              aria-roledescription="carousel"
              aria-label="TekSpyk learning highlights. Rotation pauses while this area is focused or hovered."
              aria-live="off"
              tabIndex={0}
              className="w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
              onMouseEnter={() => setIsHeroHovered(true)}
              onMouseLeave={() => setIsHeroHovered(false)}
              onFocusCapture={() => setIsHeroFocused(true)}
              onBlurCapture={handleHeroBlur}
            >
              <h1 className="text-hero mt-8 grid w-full max-w-4xl grid-cols-1 overflow-hidden whitespace-pre-line text-[clamp(2.6rem,1.3rem+5vw,4.5rem)] leading-[1.05] tracking-[-0.03em]">
                {heroSlides.map((slide, index) => (
                  <span
                    key={slide.heading}
                    aria-hidden={index !== heroSlideIndex}
                    className="col-start-1 row-start-1 block w-full transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none"
                    style={{
                      opacity: index === heroSlideIndex ? 1 : 0,
                      transform: index === heroSlideIndex ? "translateY(0) scale(1)" : "translateY(0.75rem) scale(0.97)",
                      filter: index === heroSlideIndex ? "blur(0)" : "blur(7px)",
                      transitionDuration: prefersReducedMotion ? "0ms" : "700ms",
                      zIndex: index === heroSlideIndex ? 1 : 0,
                    }}
                  >
                    {slide.heading}
                  </span>
                ))}
              </h1>
              <p className="mt-6 grid w-full max-w-2xl grid-cols-1 overflow-hidden text-lg leading-7 text-ink-soft sm:text-xl sm:leading-8">
                {heroSlides.map((slide, index) => (
                  <span
                    key={slide.heading}
                    aria-hidden={index !== heroSlideIndex}
                    className="col-start-1 row-start-1 block w-full transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none"
                    style={{
                      opacity: index === heroSlideIndex ? 1 : 0,
                      transform: index === heroSlideIndex ? "translateY(0) scale(1)" : "translateY(0.75rem) scale(0.97)",
                      filter: index === heroSlideIndex ? "blur(0)" : "blur(7px)",
                      transitionDuration: prefersReducedMotion ? "0ms" : "700ms",
                      zIndex: index === heroSlideIndex ? 1 : 0,
                    }}
                  >
                    {slide.description}
                  </span>
                ))}
              </p>
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <Link
                href="/onboarding"
                onClick={() => goToOnboarding("hero")}
                className="glow-border inline-flex items-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white shadow-[0_10px_30px_rgba(37,99,235,0.30)] transition-all hover:-translate-y-0.5 hover:bg-blue-deep"
              >
                Start registration
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#curriculum"
                className="inline-flex items-center gap-2 text-base font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white">
                  <Play className="h-3.5 w-3.5 fill-current" />
                </span>
                Explore curriculum
              </a>
            </div>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2.5" aria-hidden="true">
                {learnerAvatars.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={36}
                    height={36}
                    sizes="32px"
                    className="h-8 w-8 rounded-full border-2 border-white object-cover"
                  />
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

        {/* Program Selector */}
        <section id="programs" aria-labelledby="programs-heading" className="py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="programs-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                Choose Your Program
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                Two distinct programs built for different starting points. Both lead to real, deployable skills.
              </p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <a
                href="#curriculum"
                className="glow-border group flex flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex rounded-xl bg-blue/10 p-3 text-blue">
                    <Sparkles className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-blue/10 px-3 py-1 text-xs font-semibold text-blue">
                    Advanced
                  </span>
                </div>
                <h3 className="mt-5 text-xl">AI Engineering Program</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                  AI-powered software engineering. Plan, build, test, deploy, and monitor real products using AI as your accelerator.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue transition-colors group-hover:text-blue-deep">
                  Explore curriculum
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>

              <a
                href="#computer-training"
                className="glow-border group flex flex-col rounded-2xl border border-line bg-white p-6 transition-shadow hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex rounded-xl bg-blue/10 p-3 text-blue">
                    <Code2 className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-surface-deep px-3 py-1 text-xs font-semibold text-ink-soft">
                    Beginner → Advanced
                  </span>
                </div>
                <h3 className="mt-5 text-xl">Computer Training Program</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">
                  From computer basics to professional web development. Microsoft Office, graphic design, coding, and cybersecurity in one structured program.
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue transition-colors group-hover:text-blue-deep">
                  Explore curriculum
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
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
              <CurriculumExplorer topicStates={topicStates} />
            </div>
          </div>
        </section>

        {/* Computer Training Program */}
        <section id="computer-training" aria-labelledby="ct-heading" className="bg-surface py-[clamp(4rem,3rem+4vw,7rem)]">
          <div className="mx-auto max-w-6xl px-5">
            <div className="max-w-2xl">
              <h2 id="ct-heading" className="text-[clamp(1.85rem,1.2rem+2.4vw,2.75rem)] tracking-[-0.02em]">
                Computer Training Program
              </h2>
              <p className="mt-3 text-lg text-ink-soft">
                A structured path from computer basics to web development. Choose the 3-month intensive or the 6-month comprehensive program.
              </p>
            </div>
            <div className="mt-12">
              <ComputerTrainingExplorer topicStates={topicStates} />
            </div>
          </div>
        </section>

        <section aria-labelledby="path-heading" className="py-[clamp(4rem,3rem+4vw,7rem)]">
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
                Start registration
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
              Start your registration
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
              Submit a registration request to share the learning path you are interested in.
            </p>
            <Link
              href="/onboarding"
              onClick={() => goToOnboarding("footer_cta")}
              className="glow-border mt-8 inline-flex items-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
            >
              Start registration
              <ArrowRight className="h-4 w-4" />
            </Link>

            <form onSubmit={handleNewsletterSubmit} className="mx-auto mt-12 flex max-w-md flex-col gap-3 sm:flex-row">
              <label htmlFor="registration-email" className="sr-only">
                Email address
              </label>
              <input
                id="registration-email"
                type="email"
                value={registrationEmail}
                onChange={(event) => setRegistrationEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                className="h-12 flex-1 rounded-xl border border-white/20 bg-white/10 px-4 text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-xl bg-white px-6 font-semibold text-ink transition-colors hover:bg-white/90"
              >
                Continue
              </button>
            </form>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/50">
              Your email will be prefilled in the registration form. Submitting it sends a request; it does not create an account.
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
              <li><a href="#programs" className="transition-colors hover:text-ink">Programs</a></li>
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
                  Start registration
                </Link>
              </li>
              <li><a href="mailto:hello@tekspyk.com" className="transition-colors hover:text-ink">hello@tekspyk.com</a></li>
              <li><Link href="/terms" className="transition-colors hover:text-ink">Terms</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link></li>
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
