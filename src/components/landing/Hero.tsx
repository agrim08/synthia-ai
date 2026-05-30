import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, Check, GitBranch, MessagesSquare, FileText, CreditCard } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { InstantIndexingMockup, ChatCodebaseMockup, CommitIntelligenceMockup, TransparentBillingMockup } from "./Mockups";

const screens = [
  { label: "Commit Intelligence", icon: GitBranch, accent: "bg-coral-soft", desc: "Every commit, decoded.", component: CommitIntelligenceMockup },
  { label: "Chat Your Codebase", icon: MessagesSquare, accent: "bg-sky", desc: "Full context, every time.", component: ChatCodebaseMockup },
  { label: "Instant Indexing", icon: FileText, accent: "bg-sage", desc: "Analyze repos instantly.", component: InstantIndexingMockup },
  { label: "Transparent Billing", icon: CreditCard, accent: "bg-butter", desc: "1 credit = 1 file.", component: TransparentBillingMockup },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setActive((p) => (p + 1) % screens.length), 3400);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const select = (i: number) => {
    setActive(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActive((p) => (p + 1) % screens.length), 3400);
  };

  return (
    <section className="relative overflow-hidden pb-24 pt-24 md:pt-28">
      {/* Floating decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[6%] top-32 h-72 w-72 animate-blob rounded-full bg-coral-soft/60 blur-3xl" />
        <div className="absolute right-[4%] top-20 h-80 w-80 animate-blob rounded-full bg-sky/50 blur-3xl [animation-delay:-4s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-butter/60 blur-3xl [animation-delay:-8s]" />
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full hidden dark:block bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent)] blur-3xl pointer-events-none" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Pill */}
        <a
          href="#features"
          className="group inline-flex animate-fade-up items-center gap-2 rounded-full border border-ink/10 bg-card/70 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft backdrop-blur-md transition-transform hover:-translate-y-0.5"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-coral text-white">
            <Sparkles className="h-3 w-3" />
          </span>
          New · GitHub Intelligence v2
          <span className="text-ink-soft transition-transform group-hover:translate-x-0.5">→</span>
        </a>

        {/* Headline */}
        <h1
          className="mt-7 animate-fade-up text-[52px] font-semibold tracking-[-0.04em] text-ink leading-[1.1] text-balance"
          style={{ animationDelay: "80ms" }}
        >
          Understand any codebase
          <br />
          in <span className="font-display italic font-bold text-coral text-[64px]">minutes</span>, not{" "}
          <span className="font-display italic font-bold text-coral text-[64px]">months.</span>
        </h1>

        <p
          className="mx-auto mt-10 max-w-2xl animate-fade-up text-base text-slate-500 dark:text-slate-400 text-balance"
          style={{ animationDelay: "160ms" }}
        >
          Connect to GitHub for instant answers, automated documentation, and deep code intelligence.
        </p>

        {/* CTAs */}
        <div
          className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <SignedOut>
            <a
              href="/sign-in"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              Start for free
              <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </SignedOut>
          <SignedIn>
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              Dashboard
              <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </SignedIn>
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-transparent bg-transparent px-4 py-2 text-sm font-medium text-ink-soft transition-all hover:-translate-y-0.5 hover:border-ink/10 hover:bg-ink/5 hover:text-ink"
          >
            <span className="font-display text-base leading-none">▶</span>
            Watch the 60s demo
          </a>
        </div>

        {/* Social proof */}
        <div
          className="mt-6 flex animate-fade-up flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-ink-soft"
          style={{ animationDelay: "320ms" }}
        >
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-coral text-coral" />
              ))}
            </div>
            <span className="font-semibold text-ink">4.9</span>
            <span>on G2</span>
          </div>
          <span className="hidden h-1 w-1 rounded-full bg-ink/30 sm:inline-block" />
          <span>Trusted by 10,000+ developers</span>
          <span className="hidden h-1 w-1 rounded-full bg-ink/30 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 text-sage" />
            No card required
          </span>
        </div>

        {/* Browser screenshot */}
        <div
          className="mx-auto mt-12 max-w-3xl animate-fade-up"
          style={{ animationDelay: "420ms" }}
        >
          <div className="relative">
            {/* Floating sticker decorations */}
            <div className="pointer-events-none absolute -left-6 top-6 z-10 hidden -rotate-12 animate-float rounded-2xl border border-ink/10 bg-card px-3 py-2 text-xs font-semibold shadow-pop-sm md:block">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sage" />
                Indexing 14,302 files
              </span>
            </div>
            <div
              className="pointer-events-none absolute -right-8 top-12 hidden rotate-6 animate-float rounded-2xl border border-ink/10 bg-card px-3 py-2 text-xs font-semibold shadow-pop-sm md:block"
              style={{ animationDelay: "-3s" }}
            >
              <span className="flex items-center gap-1.5 text-ink">
                <Sparkles className="h-3 w-3 text-coral" />
                "Where is auth handled?"
              </span>
            </div>

            {/* Browser chrome */}
            <div className="rounded-3xl border border-ink/10 dark:border-white/[0.08] bg-card p-2 shadow-pop relative z-0">
              <div className="flex items-center gap-2 border-b border-ink/5 px-3 py-2">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-coral/80" />
                  <span className="h-3 w-3 rounded-full bg-butter" />
                  <span className="h-3 w-3 rounded-full bg-sage" />
                </div>
                <div className="ml-3 flex flex-1 items-center gap-1.5 rounded-md bg-cream-deep px-3 py-1 text-[11px] text-ink-soft">
                  <span className="h-1.5 w-1.5 rounded-full bg-sage" />
                  ownyourcode.ai/{screens[active]?.label.toLowerCase().replace(/\s+/g, "-")}
                </div>
                <div className="hidden items-center gap-1 md:flex">
                  {screens.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => select(i)}
                      aria-label={`Show screen ${i + 1}`}
                      className={[
                        "h-1.5 rounded-full transition-all duration-500",
                        i === active ? "w-6 bg-ink" : "w-1.5 bg-ink/20 hover:bg-ink/40",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </div>

              {/* Screen area */}
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#0a0a0a]">
                {screens.map((screen, i) => {
                  const Icon = screen.icon;
                  const Component = screen.component;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        opacity: i === active ? 1 : 0,
                        pointerEvents: i === active ? "auto" : "none",
                        transform:
                          i === active
                            ? "scale(1) translateY(0)"
                            : i < active
                            ? "scale(0.97) translateY(-12px)"
                            : "scale(0.97) translateY(12px)",
                      }}
                    >
                      <Component />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature label pills */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {screens.map((screen, i) => {
                const Icon = screen.icon;
                return (
                  <button
                    key={i}
                    onClick={() => select(i)}
                    className={[
                      "group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-300",
                      i === active
                        ? "border-ink bg-ink text-cream shadow-pop-sm"
                        : "border-ink/10 bg-card text-ink-soft hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink",
                    ].join(" ")}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {screen.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

