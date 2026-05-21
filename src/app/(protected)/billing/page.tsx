"use client";

import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/paypal";
import { api } from "@/trpc/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  ShieldCheck,
  Clock3,
  TrendingUp,
} from "lucide-react";

const CREDIT_TIERS = [
  {
    label: "Starter",
    credits: 100,
    description: "Good for trying out indexing",
  },
  {
    label: "Popular",
    credits: 500,
    description: "Best for active projects",
    recommended: true,
  },
  {
    label: "Power User",
    credits: 1000,
    description: "Built for heavy repository analysis",
  },
];

export default function BillingPage() {
  const { data: user } = api.project.getMyCredits.useQuery();

  const userCredits = user?.credits ?? 0;

  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([500]);
  const [selectedTier, setSelectedTier] = useState<number>(500);

  const credits = creditsToBuy[0]!;
  const total = credits.toFixed(2);

  const estimatedDaysLeft = Math.max(
    3,
    Math.floor((userCredits + credits) / 28),
  );

  const estimatedRepos = Math.floor(credits / 80);

  const usageStats = useMemo(
    () => [
      {
        label: "Average Daily Usage",
        value: "28 credits/day",
      },
      {
        label: "Repositories Indexed",
        value: "14 repos",
      },
      {
        label: "Successful Indexing Rate",
        value: "99.2%",
      },
    ],
    [],
  );

  const handleTierSelect = (value: number) => {
    setCreditsToBuy([value]);
    setSelectedTier(value);
  };

  const handleSlider = (value: number[]) => {
    setCreditsToBuy(value);
    setSelectedTier(value[0]!);
  };

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        {/* HEADER */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center rounded-full border border-ink/10 bg-card px-3 py-1 text-xs font-medium text-ink-soft">
            Billing & Credits
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
            Keep your workflow uninterrupted.
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
            Purchase credits anytime. No subscriptions, no forced renewals, and
            no expiry dates.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_430px]">
          {/* LEFT SIDE */}
          <div className="space-y-6">
            {/* ACCOUNT OVERVIEW */}
            <section className="rounded-2xl border border-ink/10 bg-card p-7 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-soft">
                    Current Balance
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight">
                      {userCredits}
                    </span>

                    <span className="pb-1 text-sm text-ink-soft">
                      credits
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-ink/10 bg-cream-deep/40 p-3">
                  <CreditCard className="h-5 w-5 text-coral" />
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-ink/10 bg-cream-deep/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Remaining Capacity
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    ~{Math.floor(userCredits / 80)} repos
                  </p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-cream-deep/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Last Indexed
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    2 hours ago
                  </p>
                </div>

                <div className="rounded-xl border border-ink/10 bg-cream-deep/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
                    Estimated Runtime
                  </p>

                  <p className="mt-2 text-xl font-semibold">
                    {estimatedDaysLeft} days
                  </p>
                </div>
              </div>
            </section>

            {/* USAGE INSIGHTS */}
            <section className="rounded-2xl border border-ink/10 bg-card p-7 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-ink/10 bg-cream-deep/40 p-2.5">
                  <TrendingUp className="h-4 w-4 text-coral" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Usage Insights
                  </h2>

                  <p className="text-sm text-ink-soft">
                    Based on recent indexing activity.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {usageStats.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-ink/10 bg-cream-deep/20 px-4 py-4"
                  >
                    <span className="text-sm text-ink-soft">
                      {item.label}
                    </span>

                    <span className="text-sm font-semibold">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* RETENTION BLOCK */}
            <section className="rounded-2xl border border-coral/20 bg-coral-soft/20 p-7">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-coral/10 p-3">
                  <Clock3 className="h-5 w-5 text-coral" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    Low balance alerts coming soon
                  </h3>

                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                    Get notified before your credits run low so indexing and
                    repository analysis never gets interrupted.
                  </p>
                </div>
              </div>
            </section>

            {/* SUPPORT */}
            <section className="rounded-2xl border border-ink/10 bg-card p-7 shadow-sm">
              <h3 className="text-lg font-semibold">
                Billing Support
              </h3>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <button className="rounded-xl border border-ink/10 bg-cream-deep/20 px-5 py-4 text-left transition-all hover:border-ink/20">
                  <p className="font-medium">Pricing Documentation</p>

                  <p className="mt-1 text-sm text-ink-soft">
                    Learn how credits are consumed.
                  </p>
                </button>

                <button className="rounded-xl border border-ink/10 bg-cream-deep/20 px-5 py-4 text-left transition-all hover:border-ink/20">
                  <p className="font-medium">Contact Support</p>

                  <p className="mt-1 text-sm text-ink-soft">
                    Get help with billing and payments.
                  </p>
                </button>
              </div>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <aside className="sticky top-24 h-fit rounded-2xl border border-ink/10 bg-card shadow-sm">
            {/* HEADER */}
            <div className="border-b border-ink/10 p-7">
              <h2 className="text-2xl font-semibold">
                Purchase Credits
              </h2>

              <p className="mt-2 text-sm text-ink-soft">
                Scale indexing capacity instantly.
              </p>
            </div>

            <div className="space-y-8 p-7">
              {/* TIERS */}
              <div className="space-y-3">
                {CREDIT_TIERS.map((tier) => {
                  const active = selectedTier === tier.credits;

                  return (
                    <button
                      key={tier.credits}
                      onClick={() => handleTierSelect(tier.credits)}
                      className={[
                        "relative w-full rounded-2xl border p-5 text-left transition-all",
                        active
                          ? "border-coral ring-1 ring-coral"
                          : "border-ink/10 hover:border-ink/20",
                      ].join(" ")}
                    >
                      {tier.recommended && (
                        <div className="absolute right-4 top-4 rounded-full bg-coral px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                          Recommended
                        </div>
                      )}

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            {tier.label}
                          </p>

                          <p className="mt-1 text-xs text-ink-soft">
                            {tier.description}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-semibold">
                            {tier.credits}
                          </p>

                          <p className="text-xs text-ink-soft">
                            credits
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* SLIDER */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Custom Amount
                  </span>

                  <span className="text-sm font-semibold">
                    {credits} credits
                  </span>
                </div>

                <Slider
                  value={creditsToBuy}
                  onValueChange={handleSlider}
                  min={50}
                  max={5000}
                  step={50}
                  className="
                    [&_[data-slot=slider-track]]:h-2
                    [&_[data-slot=slider-track]]:bg-ink/10
                    [&_[data-slot=slider-range]]:bg-coral
                    [&_[data-slot=slider-thumb]]:h-5
                    [&_[data-slot=slider-thumb]]:w-5
                    [&_[data-slot=slider-thumb]]:border-coral
                    [&_[data-slot=slider-thumb]]:bg-cream
                  "
                />

                <div className="mt-2 flex justify-between text-xs text-ink-soft">
                  <span>50</span>
                  <span>5000</span>
                </div>
              </div>

              {/* PROJECTION */}
              <div className="rounded-2xl border border-ink/10 bg-cream-deep/20 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-soft">
                    Estimated Coverage
                  </span>

                  <span className="font-semibold">
                    ~{estimatedDaysLeft} days
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-ink-soft">
                    Estimated Repositories
                  </span>

                  <span className="font-semibold">
                    ~{estimatedRepos}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-ink-soft">
                    Cost Per Credit
                  </span>

                  <span className="font-semibold">
                    ₹1.00
                  </span>
                </div>
              </div>

              {/* TOTAL */}
              <div className="border-t border-ink/10 pt-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-ink-soft">
                      Total
                    </p>

                    <div className="mt-1 flex items-end gap-1">
                      <span className="text-4xl font-semibold tracking-tight">
                        ₹{total}
                      </span>

                      <span className="pb-1 text-sm text-ink-soft">
                        INR
                      </span>
                    </div>
                  </div>
                </div>

                {/* TRUST */}
                <div className="mt-6 space-y-3">
                  {[
                    "Credits never expire",
                    "Secure payment processing",
                    "Instant credit activation",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-ink-soft"
                    >
                      <Check className="h-4 w-4 text-coral" />

                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() => createCheckoutSession(credits)}
                  className="
                    mt-7 inline-flex h-12 w-full items-center justify-center gap-2
                    rounded-xl bg-coral px-5 text-sm font-semibold text-cream
                    transition-all hover:opacity-90
                  "
                >
                  Purchase Credits

                  <ArrowRight className="h-4 w-4" />
                </button>

                {/* FOOTNOTE */}
                <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
                  <ShieldCheck className="h-3.5 w-3.5 text-coral" />

                  <span>
                    No subscriptions. Pay only for what you use.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}