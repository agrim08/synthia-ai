import { Github, Globe } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";

export function CtaFooter() {
  return (
    <>
      <section id="cta" className="px-6 pb-16 pt-12">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-ink/10 bg-mesh p-10 text-center shadow-pop md:p-16">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-10 top-10 h-40 w-40 animate-float rounded-full bg-coral/30 blur-2xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 animate-float rounded-full bg-sky/40 blur-2xl [animation-delay:-3s]" />
          </div>
          <div className="relative">
            <h2 className="text-balance font-semibold tracking-tight text-ink text-4xl md:text-6xl">
              Your codebase, but{" "}
              <span className="font-display italic text-coral">finally understood</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-ink-soft">
              Free to start. Pay-as-you-go after that. Connect a repo in 30 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <SignedOut>
                <a
                  href="/sign-in"
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
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
                  className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
                >
                  Go to Dashboard
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-coral text-white transition-transform group-hover:rotate-12">
                    →
                  </span>
                </a>
              </SignedIn>
              <a
                href="https://github.com/agrim08/ownyourcode-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/80 px-6 py-3.5 text-sm font-semibold text-ink backdrop-blur transition-all hover:-translate-y-0.5 hover:border-ink/40"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 px-6 py-12">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-ink text-cream">
                <Logo width={20} height={20} />
              </span>
              <span className="font-semibold text-ink">OwnYourCode</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              The AI-powered intelligence layer for your engineering team.
              Understand any codebase, anywhere, anytime.
            </p>
          </div>

          {[
            { title: "Product", items: ["Features", "Integrations", "Pricing", "Enterprise", "Changelog"] },
            { title: "Resources", items: ["Documentation", "API Reference", "Guides", "Blog", "Status"] },
            { title: "Company", items: ["About", "Customers", "Privacy", "Terms", "Security"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.items.map((it) => (
                  <li key={it}>
                    <a
                      href={`/${it.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-sm text-ink-soft underline-grow hover:text-ink"
                    >
                      {it}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-ink/10 pt-6 text-xs text-ink-soft md:flex-row">
          <span>© 2026 OwnYourCode AI · Built for developers, with care.</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> English (US)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
              All systems operational
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
