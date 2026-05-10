import { GitBranch, FileText, ShieldCheck, BarChart3, MessagesSquare, Sparkles } from "lucide-react";

export function Bento() {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink">
            <Sparkles className="h-3 w-3 text-coral" />
            Features
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Everything your team needs to{" "}
            <span className="font-display italic text-coral">ship faster</span>.
          </h2>
          <p className="mt-4 text-balance text-ink-soft">
            One platform. Zero context-switching. From understanding to documentation
            to review — OwnYourCode handles it all.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6 md:grid-rows-2">
          {/* Big card — chat */}
          <div className="group relative col-span-1 row-span-1 overflow-hidden rounded-3xl border border-ink/10 bg-white p-6 shadow-pop-sm md:col-span-4 md:row-span-2 md:p-8">
            <div className="relative z-10">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-cream">
                  <GitBranch className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                  GitHub Intelligence
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                Ask any question. Get the actual answer.
              </h3>
              <p className="mt-2 max-w-md text-sm text-ink-soft">
                Natural language queries over your entire repository. Understand structure,
                ownership, and patterns at a glance.
              </p>
            </div>

            {/* Chat mock */}
            <div className="relative z-10 mt-6 space-y-3">
              <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-4 py-2.5 text-sm text-cream shadow-pop-sm">
                What does the payments module depend on?
              </div>
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-ink/10 bg-cream-deep/50 px-4 py-3 text-sm text-ink">
                <code className="font-mono text-coral">payments/</code> depends on{" "}
                <code className="font-mono">stripe-sdk</code>,{" "}
                <code className="font-mono">db/transactions</code>, and{" "}
                <code className="font-mono">utils/retry</code>.
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-sage/30 px-2 py-0.5 text-[10px] font-semibold text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  No circular dependencies
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-ink-soft">
                <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
                Thinking…
              </div>
            </div>

            <div
              aria-hidden
              className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-coral-soft/40 blur-3xl"
            />
          </div>

          {/* Auto docs */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-ink/10 bg-sky/30 p-6 shadow-pop-sm md:col-span-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-pop-sm">
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-ink">Auto Documentation</h3>
            <p className="mt-1 text-sm text-ink-soft">Always-fresh docs in seconds.</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Markdown", "Notion", "Confluence", "HTML"].map((fmt) => (
                <span
                  key={fmt}
                  className="rounded-full border border-ink/10 bg-white/80 px-2.5 py-1 text-[11px] font-semibold text-ink"
                >
                  {fmt}
                </span>
              ))}
            </div>
          </div>

          {/* Secure */}
          <div className="group relative col-span-1 overflow-hidden rounded-3xl border border-ink/10 bg-sage/30 p-6 shadow-pop-sm md:col-span-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-pop-sm">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h3 className="mt-4 text-xl font-semibold text-ink">Enterprise Secure</h3>
            <p className="mt-1 text-sm text-ink-soft">SOC 2 · End-to-end encrypted.</p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink">
              SOC 2 Type II ✓
            </div>
          </div>
        </div>

        {/* Second row */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-butter/40 p-6 shadow-pop-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-pop-sm">
                <BarChart3 className="h-4 w-4" />
              </span>
              <h3 className="text-xl font-semibold text-ink">Code Analytics</h3>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Hotspot detection, complexity scores, contribution graphs — surfaced automatically.
            </p>
            <div className="mt-4 flex h-16 items-end gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full rounded-sm bg-ink/80 transition-all duration-500 group-hover:bg-coral"
                  style={{ height: `${30 + ((i * 23) % 70)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-ink/10 bg-coral-soft/50 p-6 shadow-pop-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ink shadow-pop-sm">
                <MessagesSquare className="h-4 w-4" />
              </span>
              <h3 className="text-xl font-semibold text-ink">Chat Your Repo</h3>
            </div>
            <p className="mt-2 text-sm text-ink-soft">
              Talk to your codebase like you'd talk to a senior engineer who's read every single file.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Explain this", "Find bugs", "Write tests", "Summarize PR"].map((q) => (
                <span
                  key={q}
                  className="cursor-pointer rounded-full border border-ink/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-ink transition-transform hover:-translate-y-0.5"
                >
                  {q}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
