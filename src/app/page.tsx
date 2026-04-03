import Link from "next/link";
import Image from "next/image";
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
  Check,
  HelpCircle,
  Plus,
  ArrowUpRight,
  Globe,
  Settings,
  ShieldCheck,
  CreditCard,
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

  const steps = [
    {
      title: "Connect Repo",
      desc: "Link GitHub or GitLab repo in one click. We index immediately.",
      icon: <GitBranch className="h-5 w-5" />,
    },
    {
      title: "AI Analysis",
      desc: "Semantic mapping of your logic, structure, and intent.",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Get Insights",
      desc: "Ask questions, generate docs, or get deep reviews instantly.",
      icon: <Zap className="h-5 w-5" />,
    },
  ];

  const pricing = [
    {
      name: "Starter Pack",
      price: "₹100",
      desc: "Perfect for exploring your first few repositories.",
      features: ["100 Credits included", "1 Credit = 1 File indexed", "No monthly commitment", "Standard RAG intelligence"],
      cta: "Buy Credits",
      popular: false,
    },
    {
      name: "Pro Pack",
      price: "₹500",
      desc: "Best for active developers and small teams.",
      features: ["500 Credits included", "Priority indexing speed", "Advanced code insights", "Everything in Starter"],
      cta: "Get Pro Pack",
      popular: true,
    },
    {
      name: "Team Fuel",
      price: "₹1000",
      desc: "Scale your intelligence with a larger credit buffer.",
      features: ["1,000 Credits included", "Priority support", "No expiry on credits", "Advanced analytics"],
      cta: "Get Team Pack",
      popular: false,
    },
  ];

  const faqs = [
    {
      q: "How does the credit system work?",
      a: "Synthia uses a simple pay-as-you-go model. 1 credit equals 1 file indexed. There are no monthly subscriptions—you just top up your credits whenever you need more 'intelligence fuel' for your repositories.",
    },
    {
      q: "How secure is my code?",
      a: "Your code never leaves your control. We use end-to-end encryption and SOC 2 Type II compliant infrastructure to ensure your data stays private and secure.",
    },
    {
      q: "Do credits ever expire?",
      a: "No. Once you purchase credits, they stay in your account balance until you use them for indexing repositories. There is no time limit or recurring fee.",
    },
    {
      q: "Does it support private repos?",
      a: "Yes, Synthia works seamlessly with both public and private repositories on GitHub, GitLab, and Bitbucket using secure OAuth or personal access tokens.",
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
              <span className="text-indigo-600">
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
              {/* Mock UI body - Actual Screenshot */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-50">
                <Image
                  src="/dashboard.png"
                  alt="Synthia Dashboard Screenshot"
                  fill
                  className="object-cover object-top scale-[1.02] origin-top-left transition-opacity duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works / Stepper ────────────────────────── */}
        <section className="py-24 px-6 md:py-32 bg-slate-50/30">
          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.025em] text-slate-900">
                Ship faster in three simple steps.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-3 relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-10 left-0 w-full h-px bg-slate-100 -z-10" />
              
              {steps.map((step, i) => (
                <div key={step.title} className="text-center group">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm transition-all duration-300">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors">
                      {step.icon}
                    </div>
                  </div>
                  <div className="mb-2 text-[12px] font-bold uppercase tracking-widest text-indigo-500">Step 0{i+1}</div>
                  <h3 className="mb-3 text-[18px] font-bold text-slate-900">{step.title}</h3>
                  <p className="text-[14px] leading-relaxed text-slate-500">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* ── Logos / social proof strip ────────────────────── */}
        <section className="bg-slate-50/60 py-8">
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

                {/* ── Integrations Strip ────────────────────────────── */}
        <section className="border-y border-slate-100 bg-white py-12">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left max-w-xs">
                <h3 className="text-[16px] font-bold text-slate-900">Ecosystem Integrations</h3>
                <p className="text-[13px] text-slate-500 mt-1">Works with the tools your team already uses every day.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 grayscale opacity-40 hover:opacity-100 transition-opacity duration-300">
                {["GitHub", "GitLab", "VS Code", "Slack", "Jira", "Vercel"].map((tool) => (
                  <span key={tool} className="text-[15px] font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                    {tool === "GitHub" && <GithubIcon className="h-4 w-4" />}
                    {tool}
                  </span>
                ))}
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

        {/* ── Pricing Section ──────────────────────────────── */}
        <section id="pricing" className="py-24 px-6 md:py-32 bg-slate-50/40">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-indigo-600">
                <CreditCard className="h-2.5 w-2.5" />
                Pricing
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.025em] text-slate-900">
                Simple, transparent pricing.
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {pricing.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                    tier.popular
                      ? "border-indigo-200 bg-white shadow-xl shadow-indigo-100/50 scale-105 z-10"
                      : "border-slate-200 bg-white/50 hover:bg-white hover:shadow-lg"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div className="mb-8">
                    <h3 className="text-[18px] font-bold text-slate-900">{tier.name}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">{tier.price}</span>
                      {tier.price !== "Custom" && <span className="text-[14px] text-slate-500">/month</span>}
                    </div>
                    <p className="mt-3 text-[14px] text-slate-500 leading-relaxed">{tier.desc}</p>
                  </div>
                  <div className="mb-8 space-y-4 flex-1">
                    {tier.features.map((f) => (
                      <div key={f} className="flex items-center gap-3 text-[14px] text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                  <Button
                    className={`h-11 rounded-xl font-bold text-[14px] transition-all ${
                      tier.popular
                        ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {tier.cta}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ Section ───────────────────────────────────── */}
        <section id="faq" className="py-24 px-6 md:py-32">
          <div className="mx-auto max-w-3xl">
            <div className="mb-16 text-center">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <HelpCircle className="h-2.5 w-2.5" />
                Common Questions
              </div>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-extrabold tracking-[-0.025em] text-slate-900">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mx-auto max-w-2xl space-y-4 text-left">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:border-slate-200 hover:shadow-sm [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-[16px] font-bold text-slate-900 list-none">
                    {faq.q}
                    <Plus className="h-4 w-4 text-slate-400 group-open:rotate-45 transition-transform duration-200" />
                  </summary>
                  <p className="mt-4 text-[14px] leading-relaxed text-slate-500">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>


        {/* ── Footer ────────────────────────────────────────── */}
        <footer className="border-t border-slate-100 bg-white pt-20 pb-10 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-12 md:grid-cols-5 md:gap-8 mb-20">
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-6">
                  <Logo width={32} height={32} />
                  <span className="text-[18px] font-bold text-slate-900 tracking-tight">Synthia</span>
                </div>
                <p className="max-w-xs text-[14px] leading-relaxed text-slate-500 mb-8">
                  The AI-powered intelligence layer for your engineering team. Understand any codebase, anywhere, anytime.
                </p>
                <div className="flex items-center gap-4">
                  <Link href="#" className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors">
                    <GithubIcon className="h-4 w-4" />
                  </Link>
                  <Link href="#" className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:text-indigo-600 transition-colors text-[14px] font-bold">
                    𝕏
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 mb-6">Product</h4>
                <ul className="space-y-4">
                  {["Features", "Integrations", "Pricing", "Enterprise", "Changelog"].map(item => (
                    <li key={item}>
                      <Link href="#" className="text-[14px] text-slate-500 hover:text-indigo-600 transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 mb-6">Resources</h4>
                <ul className="space-y-4">
                  {["Documentation", "API Reference", "Guides", "Blog", "Status"].map(item => (
                    <li key={item}>
                      <Link href="#" className="text-[14px] text-slate-500 hover:text-indigo-600 transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-slate-900 mb-6">Company</h4>
                <ul className="space-y-4">
                  {["About", "Customers", "Privacy", "Terms", "Security"].map(item => (
                    <li key={item}>
                      <Link href="#" className="text-[14px] text-slate-500 hover:text-indigo-600 transition-colors">{item}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <p className="text-[13px] text-slate-400">
                © 2024 Synthia AI. Built for developers.
              </p>
              <div className="flex items-center gap-8">
                <span className="flex items-center gap-2 text-[13px] text-slate-400">
                  <Globe className="h-3.5 w-3.5" />
                  English (US)
                </span>
                <span className="flex items-center gap-2 text-[13px] text-slate-400">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  System Status: Operational
                </span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </HydrateClient>
  );
}