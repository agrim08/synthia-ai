import { useEffect, useState } from "react";
import Link from "next/link";
import { Github } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={[
          "flex w-full max-w-6xl items-center justify-between rounded-full border border-border/60 px-3 py-2 transition-all duration-500",
          scrolled
            ? "bg-cream/80 shadow-soft backdrop-blur-xl"
            : "bg-cream/40 backdrop-blur-md",
        ].join(" ")}
      >
        <Link href="/" className="group flex items-center gap-2 pl-3">
          <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-ink text-cream shadow-pop-sm transition-transform group-hover:-rotate-6">
            <span className="font-display text-lg leading-none">O</span>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse-soft rounded-full bg-coral" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            OwnYourCode
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {["Features", "How it works", "Pricing", "FAQ"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/agrim08/ownyourcode-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full p-2 text-ink-soft transition-colors hover:bg-cream-deep hover:text-ink sm:inline-flex"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <SignedOut>
            <a
              href="/sign-in"
              className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream shadow-pop-sm transition-all hover:-translate-y-0.5 hover:shadow-pop"
            >
              Get started
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
        </div>
      </nav>
    </header>
  );
}
