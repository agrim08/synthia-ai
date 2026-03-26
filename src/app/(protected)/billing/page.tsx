"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { createCheckoutSession } from "@/lib/paypal";
import { api } from "@/trpc/react";
import {
  Info,
  CreditCard,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import React, { useState } from "react";

const CREDIT_PRESETS = [50, 100, 250, 500, 1000];

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery();
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

  return (
    <div className="min-h-screen bg-slate-50/60 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">

        {/* ── Page Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <CreditCard className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-[22px] font-extrabold tracking-[-0.025em] text-slate-900">
              Billing & Credits
            </h1>
          </div>
          <p className="pl-9 text-[13px] text-slate-500">
            Manage your workspace's intelligence fuel
          </p>
        </div>

        {/* ── Top row: Balance + Usage ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Balance card */}
          <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white shadow-lg shadow-indigo-200/40">
            {/* decorative ring */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full border border-white/10" />

            <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-indigo-200">
              Available Balance
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[40px] font-extrabold leading-none tracking-[-0.04em] text-white">
                {user?.credits ?? "—"}
              </span>
              <span className="text-[12px] font-semibold text-indigo-200">credits</span>
            </div>
            <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-[11px] font-medium text-white/80 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3 text-indigo-200" />
              ₹1.00 per credit · no expiry
            </div>
          </div>

          {/* Usage stat cards */}
          <div className="flex flex-col gap-4 md:col-span-2 md:flex-row">
            {[
              {
                label: "Files Indexed",
                value: user?.credits ?? 0,
                unit: "files",
                icon: FileText,
                color: "indigo",
              },
              {
                label: "Est. Repos",
                value: Math.floor((user?.credits ?? 0) / 80),
                unit: "repos",
                icon: Sparkles,
                color: "violet",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-1 flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {stat.label}
                  </span>
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                      stat.color === "indigo"
                        ? "bg-indigo-50"
                        : "bg-violet-50"
                    }`}
                  >
                    <stat.icon
                      className={`h-3.5 w-3.5 ${
                        stat.color === "indigo"
                          ? "text-indigo-600"
                          : "text-violet-600"
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-slate-900">
                    {stat.value}
                  </span>
                  <span className="text-[11px] text-slate-400">{stat.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Purchase Card ── */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          {/* Card header */}
          <div className="border-b border-slate-100 px-7 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
                  <Zap className="h-4 w-4 fill-white/20 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold tracking-[-0.015em] text-slate-900">
                    Add Credits
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Select how many credits to purchase
                  </p>
                </div>
              </div>
              <div className="hidden rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 sm:block">
                Standard rate · ₹1.00 / credit
              </div>
            </div>
          </div>

          <div className="px-7 py-6 space-y-6">

            {/* Preset buttons */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                Quick Select
              </p>
              <div className="flex flex-wrap gap-2">
                {CREDIT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePreset(preset)}
                    className={`rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${
                      activePreset === preset
                        ? "border-indigo-200 bg-indigo-600 text-white shadow-md shadow-indigo-200/50"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {preset}
                    <span
                      className={`ml-1 text-[10px] font-medium ${
                        activePreset === preset ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      credits
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Slider */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Custom Amount
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[24px] font-extrabold leading-none tracking-[-0.03em] text-indigo-700">
                    {creditsToBuyAmount}
                  </span>
                  <span className="text-[11px] text-slate-400">credits</span>
                </div>
              </div>
              <Slider
                value={creditsToBuy}
                max={1000}
                min={10}
                step={10}
                onValueChange={handleSlider}
                className="py-2"
              />
              <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                <span>10</span>
                <span>1,000</span>
              </div>
            </div>

            {/* What you get */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[11px] font-semibold text-slate-700">
                  What you get with {creditsToBuyAmount} credits
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: "Files indexed", value: filesIndexed },
                  { label: "Est. repos covered", value: `~${estimatedRepos}` },
                  { label: "Cost per file", value: "₹1.00" },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-white p-3 border border-slate-100">
                    <div className="text-[15px] font-bold tracking-tight text-slate-900">
                      {item.value}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout row */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 px-5 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Total
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-slate-900">
                    ₹{price}
                  </span>
                  <span className="text-[11px] text-slate-400">INR</span>
                </div>
              </div>
              <Button
                onClick={() => createCheckoutSession(creditsToBuyAmount)}
                className="h-11 rounded-xl bg-indigo-600 px-7 text-[14px] font-bold text-white shadow-md shadow-indigo-200/60 transition-all hover:bg-indigo-700 hover:shadow-indigo-300/60 hover:-translate-y-px active:translate-y-0"
              >
                Purchase Credits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Trust / feature strip ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Deep RAG Analysis",
              desc: "Credits fuel the advanced retrieval-augmented generation engine that powers Synthia's intelligence.",
              color: "indigo",
            },
            {
              icon: Zap,
              title: "Instant Indexing",
              desc: "Files are processed and indexed in real-time. Credits are consumed only on successful indexing.",
              color: "violet",
            },
            {
              icon: ShieldCheck,
              title: "Secure Payments",
              desc: "Powered by PayPal for enterprise-grade payment security. Credits never expire.",
              color: "blue",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
            >
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  item.color === "indigo"
                    ? "bg-indigo-50"
                    : item.color === "violet"
                    ? "bg-violet-50"
                    : "bg-blue-50"
                }`}
              >
                <item.icon
                  className={`h-3.5 w-3.5 ${
                    item.color === "indigo"
                      ? "text-indigo-600"
                      : item.color === "violet"
                      ? "text-violet-600"
                      : "text-blue-600"
                  }`}
                />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-slate-900">{item.title}</h4>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default BillingPage;