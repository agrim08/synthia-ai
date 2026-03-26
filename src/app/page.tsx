import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HydrateClient } from "@/trpc/server";
import {
  GithubIcon,
  ArrowRight,
  Sparkles,
  GitBranch,
  FileText,
  Lock,
  ChevronRight,
  Star,
  Zap,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default async function Home() {
  const bentoFeatures = [
    {
      id: "intelligence",
      title: "GitHub Intelligence",
      description:
        "Ask natural language questions about any repository. Understand structure, ownership, and patterns at a glance.",
      icon: <GitBranch className="h-5 w-5" />,
      size: "large", // 2 cols
      accent: "indigo",
    },
    {
      id: "docs",
      title: "Auto Documentation",
      description: "Generate comprehensive docs for your entire codebase in seconds.",
      icon: <FileText className="h-5 w-5" />,
      size: "small",
      accent: "violet",
    },
    {
      id: "secure",
      title: "Enterprise Secure",
      description: "End-to-end encryption. Your code never leaves your control.",
      icon: <Lock className="h-5 w-5" />,
      size: "small",
      accent: "blue",
    },
    {
      id: "analytics",
      title: "Code Analytics",
      description: "Surface hotspots, complexity scores, and contribution graphs automatically.",
      icon: <BarChart3 className="h-5 w-5" />,
      size: "medium",
      accent: "indigo",
    },
    {
      id: "chat",
      title: "Ask Your Codebase",
      description: "Chat with your repo like you'd chat with a senior engineer who's read every file.",
      icon: <MessageSquare className="h-5 w-5" />,
      size: "medium",
      accent: "violet",
    },
  ];

  const stats = [
    { label: "Time Saved", value: "70%", desc: "on code reviews" },
    { label: "Repositories", value: "5k+", desc: "analyzed monthly" },
    { label: "Insights", value: "1M+", desc: "generated to date" },
    { label: "Productivity", value: "+45%", desc: "avg team lift" },
  ];

  const testimonials = [
    {
      quote: "Synthia cut our onboarding time in half. New devs understand the entire codebase on day one.",
      name: "Priya Mehta",
      role: "Engineering Lead, Kira Systems",
      avatar: "PM",
    },
    {
      quote: "I asked it to explain our auth flow and it gave a cleaner answer than our own wiki.",
      name: "James O'Brien",
      role: "Senior SWE, Layers",
      avatar: "JO",
    },
    {
      quote: "Documentation that used to take days now takes minutes. This is the future.",
      name: "Seo-yeon Park",
      role: "CTO, Relay",
      avatar: "SP",
    },
  ];

  return (
    <HydrateClient>
      <main className="min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-100">

        {/* ── Nav ───────────────────────────────────────────── */}
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-100/80 bg-white/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-2.5">
              <Logo width={34} height={34} />
              <span className="text-[17px] font-bold tracking-tight text-slate-900">Synthia</span>
            </div>

            <div className="hidden items-center gap-7 md:flex">
              {["Features", "Solutions", "Pricing", "Docs"].map((item) => (
                <Link
                  key={item}
                  href={item === "Docs" ? "/documentation" : `#${item.toLowerCase()}`}
                  className="text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                  {item}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/sign-in"
                className="hidden text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900 md:block"
              >
                Sign in
              </Link>
              <Link href="/dashboard">
                <Button className="h-8 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white shadow-none hover:bg-indigo-700 transition-colors">
                  Get Started
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36">
          {/* Subtle mesh background */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(243 75% 96%) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(260 80% 95%) 0%, transparent 60%)",
            }}
          />

          <div className="mx-auto max-w-5xl px-6 text-center">
            {/* Pill badge */}
            <div className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3.5 py-1 text-[12px] font-semibold uppercase tracking-widest text-indigo-600">
              <Sparkles className="h-3 w-3" />
              AI-Powered GitHub Intelligence
            </div>

            {/* Headline — large, tight, editorial */}
            <h1 className="mx-auto mb-6 max-w-4xl text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-slate-900">
              Understand any codebase{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, hsl(243,75%,50%) 0%, hsl(260,80%,60%) 50%, hsl(290,70%,60%) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                in minutes, not months.
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-xl text-[16px] leading-relaxed text-slate-500">
              Synthia connects to GitHub and gives your team instant answers, automated documentation,
              and deep code intelligence — all in one seamless platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-indigo-600 px-8 text-[15px] font-semibold text-white shadow-lg shadow-indigo-200/60 hover:bg-indigo-700 transition-all hover:shadow-indigo-300/60 hover:-translate-y-px"
                >
                  Start for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 rounded-xl border border-slate-200 px-8 text-[15px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  <GithubIcon className="mr-2 h-4 w-4" />
                  View on GitHub
                </Button>
              </Link>
            </div>

            {/* Social proof row */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span className="font-medium text-slate-500">4.9/5 on G2</span>
              </span>
              <span className="h-3 w-px bg-slate-200" />
              <span>Trusted by <span className="font-semibold text-slate-600">10,000+</span> developers</span>
              <span className="h-3 w-px bg-slate-200" />
              <span>
                <Zap className="mr-1 inline h-3 w-3 text-indigo-400" />
                No credit card required
              </span>
            </div>
          </div>

          {/* Hero product mockup */}
          <div className="mx-auto mt-16 max-w-4xl px-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-300/30">
              {/* Window chrome */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/70" />
                <span className="h-3 w-3 rounded-full bg-amber-400/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                <div className="mx-auto flex items-center gap-2 rounded-md bg-white border border-slate-200 px-3 py-1 text-[11px] text-slate-400">
                  <GithubIcon className="h-3 w-3" />
                  synthia.ai / dashboard
                </div>
              </div>
              {/* Mock UI body */}
              <div className="grid grid-cols-3 gap-0 text-[12px]">
                {/* Sidebar */}
                <div className="border-r border-slate-100 p-4 space-y-1">
                  {["Overview", "Repositories", "Insights", "Documentation", "Team"].map((item, i) => (
                    <div
                      key={item}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium ${
                        i === 2
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          i === 2 ? "bg-indigo-500" : "bg-slate-300"
                        }`}
                      />
                      {item}
                    </div>
                  ))}
                </div>
                {/* Main content */}
                <div className="col-span-2 p-5 space-y-3">
                  <div className="text-[13px] font-semibold text-slate-800">
                    Ask about your codebase
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[12px] text-slate-500">
                    &ldquo;How does the authentication flow work in this repo?&rdquo;
                  </div>
                  <div className="space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-indigo-500" />
                      <span className="text-[11px] font-semibold text-indigo-600">Synthia</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-slate-600">
                      The auth flow uses JWT tokens issued by{" "}
                      <code className="rounded bg-indigo-100 px-1 text-indigo-700">/api/auth/login</code>. Tokens are
                      validated in the <code className="rounded bg-indigo-100 px-1 text-indigo-700">authMiddleware</code>{" "}
                      before every protected route. Refresh tokens are stored in Redis with a 7-day TTL…
                    </p>
                  </div>
                  {/* Stat pills */}
                  <div className="flex gap-2 pt-1">
                    {["12 files analyzed", "3 services mapped", "< 1s"].map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Logos / social proof strip ────────────────────── */}
        <section className="border-y border-slate-100 bg-slate-50/60 py-8">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-6 text-center text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Trusted by engineering teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
              {["Stripe", "Vercel", "Linear", "Notion", "Figma", "Supabase"].map((co) => (
                <span key={co} className="text-[14px] font-bold tracking-tight text-slate-700">
                  {co}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bento Features ────────────────────────────────── */}
        <section id="features" className="py-24 px-6 md:py-32">
          <div className="mx-auto max-w-6xl">
            {/* Section header */}
            <div className="mb-14 max-w-lg">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-violet-600">
                <Sparkles className="h-2.5 w-2.5" />
                Features
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-extrabold leading-tight tracking-[-0.025em] text-slate-900">
                Everything your team needs to ship faster.
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
                One platform. Zero context-switching. From understanding to documentation to review — Synthia handles it all.
              </p>
            </div>

            {/* Bento grid */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {/* Large card — spans 2 cols */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/60 to-white p-7 md:col-span-2 hover:border-indigo-200 transition-all duration-300">
                <div className="mb-5 inline-flex rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm">
                  <GitBranch className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="mb-2.5 text-[19px] font-bold tracking-tight text-slate-900">
                  GitHub Intelligence
                </h3>
                <p className="mb-6 max-w-sm text-[14px] leading-relaxed text-slate-500">
                  Ask natural language questions about any repository. Understand structure, ownership,
                  and patterns at a glance — without reading a single file.
                </p>
                {/* Mini preview */}
                <div className="rounded-xl border border-indigo-100/80 bg-white/80 p-3.5 text-[12px] shadow-sm backdrop-blur">
                  <div className="mb-2 font-semibold text-slate-700">
                    &ldquo;What does the payments module depend on?&rdquo;
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    <span className="font-medium text-indigo-600">payments/</span> depends on{" "}
                    <span className="font-medium text-indigo-600">stripe-sdk</span>,{" "}
                    <span className="font-medium text-indigo-600">db/transactions</span>, and{" "}
                    <span className="font-medium text-indigo-600">utils/retry</span>. No circular dependencies detected.
                  </p>
                </div>
              </div>

              {/* Tall card — auto height */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-50/50 to-white p-7 hover:border-violet-200 transition-all duration-300">
                <div className="mb-5 inline-flex rounded-xl border border-violet-100 bg-white p-2.5 shadow-sm">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="mb-2.5 text-[19px] font-bold tracking-tight text-slate-900">
                  Auto Documentation
                </h3>
                <p className="text-[14px] leading-relaxed text-slate-500">
                  Generate comprehensive, always-fresh docs for your entire codebase in seconds.
                  Markdown, Notion, Confluence — wherever your team lives.
                </p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {["Markdown", "Notion", "Confluence", "HTML"].map((fmt) => (
                    <span
                      key={fmt}
                      className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Small card */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-blue-50/40 to-white p-7 hover:border-blue-200 transition-all duration-300">
                <div className="mb-5 inline-flex rounded-xl border border-blue-100 bg-white p-2.5 shadow-sm">
                  <Lock className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="mb-2 text-[18px] font-bold tracking-tight text-slate-900">
                  Enterprise Secure
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500">
                  End-to-end encryption. SOC 2 Type II. Your code never leaves your control.
                </p>
              </div>

              {/* Medium card */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-50/40 to-white p-7 hover:border-indigo-200 transition-all duration-300">
                <div className="mb-5 inline-flex rounded-xl border border-indigo-100 bg-white p-2.5 shadow-sm">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="mb-2 text-[18px] font-bold tracking-tight text-slate-900">
                  Code Analytics
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500">
                  Hotspot detection, complexity scores, contribution graphs — surfaced automatically.
                </p>
              </div>

              {/* Medium card */}
              <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-violet-50/40 to-white p-7 hover:border-violet-200 transition-all duration-300">
                <div className="mb-5 inline-flex rounded-xl border border-violet-100 bg-white p-2.5 shadow-sm">
                  <MessageSquare className="h-5 w-5 text-violet-600" />
                </div>
                <h3 className="mb-2 text-[18px] font-bold tracking-tight text-slate-900">
                  Chat Your Repo
                </h3>
                <p className="text-[13px] leading-relaxed text-slate-500">
                  Talk to your codebase like you'd talk to a senior engineer who's read every single file.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats section ─────────────────────────────────── */}
        <section className="bg-slate-950 py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-14 text-center">
              <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.025em] text-white">
                Numbers that speak for themselves.
              </h2>
              <p className="mt-3 text-[15px] text-slate-400">
                Real outcomes from teams shipping with Synthia every day.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur"
                >
                  <div className="mb-1 text-[2.6rem] font-extrabold tracking-tight text-white">
                    {stat.value}
                  </div>
                  <div className="text-[13px] font-semibold text-indigo-300">{stat.label}</div>
                  <div className="mt-0.5 text-[12px] text-slate-500">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-amber-600">
                <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                Testimonials
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.025em] text-slate-900">
                Loved by engineering teams.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="mb-4 flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mb-5 text-[14px] leading-relaxed text-slate-600">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-slate-900">{t.name}</div>
                      <div className="text-[12px] text-slate-400">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────── */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-indigo-600 px-8 py-16 text-center md:px-16"
            style={{
              background: "linear-gradient(135deg, hsl(243,75%,44%) 0%, hsl(260,80%,52%) 100%)",
            }}
          >
            <h2 className="mb-4 text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold tracking-[-0.025em] text-white">
              Start understanding your codebase today.
            </h2>
            <p className="mx-auto mb-8 max-w-md text-[15px] leading-relaxed text-indigo-200">
              Join 10,000+ developers who ship faster with Synthia. Free to start, no credit card required.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="h-12 rounded-xl bg-white px-8 text-[15px] font-bold text-indigo-700 shadow-none hover:bg-indigo-50 transition-colors"
                >
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/documentation">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 rounded-xl px-8 text-[15px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                >
                  Read the docs
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 bg-white py-10 px-6">
          <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <Logo width={26} height={26} />
              <span className="text-[14px] font-bold text-slate-900">Synthia</span>
            </div>

            <div className="flex items-center gap-6 text-[12px] text-slate-400">
              {["Privacy", "Terms", "Security", "Status"].map((link) => (
                <Link key={link} href="#" className="hover:text-slate-700 transition-colors">
                  {link}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-5">
              <Link href="#" className="text-slate-400 hover:text-slate-700 transition-colors">
                <GithubIcon className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors">
                Twitter
              </Link>
              <Link href="#" className="text-[12px] text-slate-400 hover:text-slate-700 transition-colors">
                LinkedIn
              </Link>
            </div>
          </div>
          <p className="mt-6 text-center text-[11px] text-slate-400">
            © 2024 Synthia AI. All rights reserved.
          </p>
        </footer>
      </main>
    </HydrateClient>
  );
}