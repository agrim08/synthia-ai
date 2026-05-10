"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/paypal";
import { api } from "@/trpc/react";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText,
  CreditCard,
  Wallet,
  Check,
  Star,
} from "lucide-react";

const CREDIT_PRESETS = [50, 100, 250, 500, 1000];

export default function BillingPage() {
  const { data: user } = api.project.getMyCredits.useQuery();
  const userCredits = user?.credits ?? 0;

  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
  const [activePreset, setActivePreset] = useState<number | null>(100);

  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = creditsToBuyAmount.toFixed(2);

  const handlePreset = (val: number) => {
    setCreditsToBuy([val]);
    setActivePreset(val);
  };

  const handleSlider = (val: number[]) => {
    setCreditsToBuy(val);
    setActivePreset(CREDIT_PRESETS.includes(val[0]!) ? val[0]! : null);
  };

  const filesIndexed = creditsToBuyAmount;
  const estimatedRepos = Math.floor(creditsToBuyAmount / 80);

  const stats = useMemo(
    () => [
      {
        label: "Available Balance",
        value: userCredits,
        unit: "credits",
        icon: Wallet,
        accent: "bg-coral-soft/60",
      },
      {
        label: "Files Indexed",
        value: userCredits,
        unit: "files",
        icon: FileText,
        accent: "bg-sage/50",
      },
      {
        label: "Est. Repos",
        value: Math.floor(userCredits / 80),
        unit: "repos",
        icon: TrendingUp,
        accent: "bg-butter/70",
      },
    ],
    [userCredits],
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-cream text-ink">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-coral-soft/50 blur-3xl animate-blob"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-0 h-96 w-96 rounded-full bg-sky/40 blur-3xl animate-blob"
        style={{ animationDelay: "-5s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-butter/50 blur-3xl animate-blob"
        style={{ animationDelay: "-9s" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* ── Page Header ── */}
        <header className="animate-fade-up text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink shadow-pop-sm">
            <Sparkles className="h-3 w-3 text-coral" />
            Billing & Credits
          </span>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-tight text-ink md:text-6xl">
            Fuel your{" "}
            <span className="font-display italic text-coral">codebase</span>{" "}
            intelligence.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-soft">
            Top up credits whenever you need them. One credit indexes one file —
            no subscriptions, no expiry, no surprises.
          </p>
        </header>

        {/* ── Top row: Stats Cards ── */}
        <section
          className="mt-12 grid gap-5 md:grid-cols-3 animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="hover-lift group relative overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-pop-sm transition-all hover:shadow-pop"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                    {stat.label}
                  </span>
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl ${stat.accent} text-ink transition-transform group-hover:rotate-6`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display text-5xl text-ink">
                    {stat.value}
                  </span>
                  <span className="text-sm text-ink-soft">{stat.unit}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Purchase Card ── */}
        <section
          className="relative mt-10 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-pop animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          {/* Sticker */}
          <span className="absolute -right-3 top-6 hidden rotate-6 rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-pop-sm md:block">
            <Star className="mr-1 inline h-3 w-3 fill-white" />
            Best value
          </span>

          {/* Card header */}
          <div className="flex flex-col gap-3 border-b border-ink/10 bg-cream-deep/40 px-8 py-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-ink">Add Credits</h2>
              <p className="text-sm text-ink-soft">
                Choose how many credits to purchase.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-semibold text-ink-soft">
              <Zap className="h-3 w-3 text-coral" />
              Standard rate · ₹1.00 / credit
            </span>
          </div>

          <div className="space-y-10 px-8 py-8">
            {/* Preset buttons */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Quick Select
              </p>
              <div className="flex flex-wrap gap-2.5">
                {CREDIT_PRESETS.map((preset) => {
                  const active = activePreset === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePreset(preset)}
                      className={[
                        "group rounded-2xl border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:-translate-y-0.5",
                        active
                          ? "border-ink bg-ink text-cream shadow-pop-sm"
                          : "border-ink/10 bg-cream-deep/40 text-ink hover:border-ink/30 hover:bg-white hover:shadow-pop-sm",
                      ].join(" ")}
                    >
                      {preset}
                      <span
                        className={`ml-1 text-[11px] font-medium ${active ? "text-cream/70" : "text-ink-soft"}`}
                      >
                        credits
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Custom Amount
                </p>
                <p className="flex items-baseline gap-1">
                  <span className="font-display text-3xl text-ink">
                    {creditsToBuyAmount}
                  </span>
                  <span className="text-sm text-ink-soft">credits</span>
                </p>
              </div>
              <Slider
                value={creditsToBuy}
                onValueChange={handleSlider}
                min={10}
                max={1000}
                step={10}
                className="[&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-ink/10 [&_[data-slot=slider-range]]:bg-coral [&_[data-slot=slider-thumb]]:h-5 [&_[data-slot=slider-thumb]]:w-5 [&_[data-slot=slider-thumb]]:border-ink [&_[data-slot=slider-thumb]]:bg-cream"
              />
              <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-soft">
                <span>10</span>
                <span>1,000</span>
              </div>
            </div>

            {/* What you get */}
            <div className="rounded-2xl border border-ink/10 bg-cream-deep/30 p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-coral" />
                <p className="text-sm font-semibold text-ink">
                  What you get with{" "}
                  <span className="marker-highlight">
                    {creditsToBuyAmount} credits
                  </span>
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Files indexed", value: filesIndexed, icon: FileText },
                  {
                    label: "Est. repos covered",
                    value: `~${estimatedRepos}`,
                    icon: TrendingUp,
                  },
                  { label: "Cost per file", value: "₹1.00", icon: CreditCard },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="hover-lift rounded-xl border border-ink/10 bg-white px-4 py-3 shadow-pop-sm"
                    >
                      <Icon className="mb-2 h-4 w-4 text-coral" />
                      <p className="font-display text-2xl text-ink">
                        {item.value}
                      </p>
                      <p className="text-xs text-ink-soft">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Checkout row */}
            <div className="flex flex-col gap-4 border-t border-ink/10 pt-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Total
                </p>
                <p className="mt-1 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl text-ink">
                    ₹{price}
                  </span>
                  <span className="text-sm text-ink-soft">INR</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => createCheckoutSession(creditsToBuyAmount)}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-coral px-7 text-sm font-bold text-white shadow-pop-sm transition-all hover:-translate-y-0.5 hover:bg-coral/90 hover:shadow-pop active:translate-y-0"
              >
                Purchase Credits
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        {/* ── Trust / feature strip ── */}
        <section
          className="mt-10 grid gap-5 md:grid-cols-3 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          {[
            {
              icon: Sparkles,
              title: "Deep RAG Analysis",
              desc: "Credits fuel the advanced retrieval-augmented generation engine powering OwnYourCode.",
              accent: "bg-coral-soft/60",
            },
            {
              icon: Zap,
              title: "Instant Indexing",
              desc: "Files are processed in real time. Credits are consumed only on successful indexing.",
              accent: "bg-butter/70",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              desc: "Enterprise-grade payment security. Credits never expire — use them whenever.",
              accent: "bg-sage/50",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="hover-lift rounded-3xl border border-ink/10 bg-white p-6 shadow-pop-sm transition-all hover:shadow-pop"
              >
                <span
                  className={`inline-grid h-11 w-11 place-items-center rounded-2xl ${item.accent} text-ink`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </section>

        {/* ── Footer reassurance ── */}
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
          <Check className="h-3.5 w-3.5 text-coral" />
          No subscriptions · Credits never expire · Cancel anytime
        </p>
      </div>
    </main>
  );
}