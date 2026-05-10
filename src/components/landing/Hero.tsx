import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, Check, GitBranch, MessagesSquare, FileText, CreditCard } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const screens = [
  { label: "Commit Intelligence", icon: GitBranch, accent: "bg-coral-soft", desc: "Every commit, decoded." },
  { label: "Chat Your Codebase", icon: MessagesSquare, accent: "bg-sky", desc: "Full context, every time." },
  { label: "Meeting Synthesis", icon: FileText, accent: "bg-sage", desc: "Audio → linked insights." },
  { label: "Transparent Billing", icon: CreditCard, accent: "bg-butter", desc: "1 credit = 1 file." },
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
    <section className="relative overflow-hidden pb-24 pt-36 md:pt-44">
      {/* Floating decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[6%] top-32 h-72 w-72 animate-blob rounded-full bg-coral-soft/60 blur-3xl" />
        <div className="absolute right-[4%] top-20 h-80 w-80 animate-blob rounded-full bg-sky/50 blur-3xl [animation-delay:-4s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-butter/60 blur-3xl [animation-delay:-8s]" />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        {/* Pill */}
        <a
          href="#features"
          className="group inline-flex animate-fade-up items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-ink shadow-soft backdrop-blur-md transition-transform hover:-translate-y-0.5"
        >
          <span className="grid h-5 w-5 place-items-center rounded-full bg-coral text-white">
            <Sparkles className="h-3 w-3" />
          </span>
          New · GitHub Intelligence v2
          <span className="text-ink-soft transition-transform group-hover:translate-x-0.5">→</span>
        </a>

        {/* Headline */}
        <h1
          className="mt-7 animate-fade-up text-balance text-5xl font-semibold tracking-[-0.04em] text-ink md:text-7xl"
          style={{ animationDelay: "80ms" }}
        >
          Understand any codebase in{" "}
          <span className="font-display italic text-coral">minutes</span>,
          <br className="hidden md:block" /> not{" "}
          <span className="relative inline-block">
            <span className="marker-highlight">months.</span>
          </span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl animate-fade-up text-balance text-lg text-ink-soft md:text-xl"
          style={{ animationDelay: "160ms" }}
        >
          OwnYourCode lets you connect to GitHub for instant answers,
          automated documentation, and deep code intelligence — all in one warm,
          surprisingly fun platform.
        </p>

        {/* CTAs */}
        <div
          className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ animationDelay: "240ms" }}
        >
          <SignedOut>
            <a
              href="/sign-in"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              Start for free
              <span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-white transition-transform group-hover:rotate-12">
                →
              </span>
            </a>
          </SignedOut>
          <SignedIn>
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[15px] font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              Go to Dashboard
              <span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-white transition-transform group-hover:rotate-12">
                →
              </span>
            </a>
          </SignedIn>
          <a
            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3.5 text-[15px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/40"
          >
            <span className="font-display text-lg leading-none">▶</span>
            Watch the 60s demo
          </a>
        </div>

        {/* Social proof */}
        <div
          className="mt-7 flex animate-fade-up flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-ink-soft"
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
          className="mx-auto mt-16 max-w-5xl animate-fade-up"
          style={{ animationDelay: "420ms" }}
        >
          <div className="relative">
            {/* Floating sticker decorations */}
            <div className="pointer-events-none absolute -left-10 -top-8 hidden -rotate-12 animate-float rounded-2xl border border-ink/10 bg-white px-3 py-2 text-xs font-semibold shadow-pop-sm md:block">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sage" />
                Indexing 14,302 files
              </span>
            </div>
            <div
              className="pointer-events-none absolute -right-8 top-12 hidden rotate-6 animate-float rounded-2xl border border-ink/10 bg-white px-3 py-2 text-xs font-semibold shadow-pop-sm md:block"
              style={{ animationDelay: "-3s" }}
            >
              <span className="flex items-center gap-1.5 text-ink">
                <Sparkles className="h-3 w-3 text-coral" />
                "Where is auth handled?"
              </span>
            </div>

            {/* Browser chrome */}
            <div className="rounded-3xl border border-ink/10 bg-white p-2 shadow-pop">
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
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-cream-deep">
                {screens.map((screen, i) => {
                  const Icon = screen.icon;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        opacity: i === active ? 1 : 0,
                        transform:
                          i === active
                            ? "scale(1) translateY(0)"
                            : i < active
                            ? "scale(0.97) translateY(-12px)"
                            : "scale(0.97) translateY(12px)",
                      }}
                    >
                      <MockScreen accent={screen.accent} title={screen.label} desc={screen.desc} Icon={Icon} />
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
                        : "border-ink/10 bg-white text-ink-soft hover:-translate-y-0.5 hover:border-ink/30 hover:text-ink",
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

function MockScreen({
  accent,
  title,
  desc,
  Icon,
}: {
  accent: string;
  title: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid h-full grid-cols-12 gap-3 p-4">
      {/* Sidebar */}
      <aside className="col-span-3 hidden flex-col gap-2 rounded-xl bg-white p-3 md:flex">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-lg bg-ink text-[10px] font-bold text-cream">
            O
          </span>
          <span className="text-xs font-semibold">OwnYourCode</span>
        </div>
        <div className="mt-2 space-y-1">
          {["Overview", title, "Repos", "Settings"].map((t) => (
            <div
              key={t}
              className={[
                "rounded-md px-2 py-1.5 text-[11px]",
                t === title ? "bg-cream-deep font-semibold text-ink" : "text-ink-soft",
              ].join(" ")}
            >
              {t}
            </div>
          ))}
        </div>
      </aside>

      {/* Main panel */}
      <main className="col-span-12 flex flex-col gap-3 rounded-xl bg-white p-4 md:col-span-9">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${accent} text-ink`}>
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold text-ink">{title}</div>
              <div className="text-[10px] text-ink-soft">{desc}</div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <span className="rounded-full bg-cream-deep px-2 py-0.5 text-[10px] font-semibold text-ink-soft">
              Live
            </span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="flex flex-col gap-2 rounded-lg border border-ink/5 bg-cream/40 p-3"
              style={{ animation: "fade-up 0.5s ease-out both", animationDelay: `${n * 80}ms` }}
            >
              <div className="h-2 w-12 rounded-full bg-ink/15" />
              <div className="h-1.5 w-16 rounded-full bg-ink/8" />
              <div className="mt-auto flex items-center justify-between">
                <div className={`h-7 w-7 rounded-md ${accent}`} />
                <span className="text-[10px] font-semibold text-ink-soft">+12%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-ink/5 bg-cream/40 p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            Activity
          </div>
          <div className="flex items-end gap-1">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={`w-full rounded-sm ${accent}`}
                style={{
                  height: `${20 + ((i * 17) % 60)}%`,
                  opacity: 0.4 + ((i * 7) % 60) / 100,
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
