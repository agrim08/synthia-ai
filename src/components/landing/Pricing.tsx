import { Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

const tiers = [
  {
    name: "Starter Pack",
    price: "₹100",
    desc: "Perfect for exploring your first few repositories.",
    features: ["100 Credits included", "1 Credit = 1 File indexed", "No monthly commitment", "Standard intelligence"],
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

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink">
            <CreditCard className="h-3 w-3 text-coral" />
            Pricing
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Simple, <span className="font-display italic text-coral">transparent</span> pricing.
          </h2>
          <p className="mt-4 text-ink-soft">
            Pay only for what you index. No subscriptions. No surprises.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={[
                "hover-lift relative flex flex-col rounded-3xl border p-7 transition-all",
                t.popular
                  ? "border-ink bg-ink text-cream shadow-pop"
                  : "border-ink/10 bg-white text-ink shadow-pop-sm hover:shadow-pop",
              ].join(" ")}
            >
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-coral px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-pop-sm">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-6xl">{t.price}</span>
                <span className={t.popular ? "text-cream/60" : "text-ink-soft"}>one-time</span>
              </div>
              <p className={`mt-2 text-sm ${t.popular ? "text-cream/70" : "text-ink-soft"}`}>
                {t.desc}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span
                      className={[
                        "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full",
                        t.popular ? "bg-coral text-white" : "bg-sage/40 text-ink",
                      ].join(" ")}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <SignedOut>
                <Link
                  href="/sign-in"
                  className={[
                    "mt-7 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5",
                    t.popular
                      ? "bg-coral text-white shadow-pop-sm hover:bg-coral/90"
                      : "bg-ink text-cream shadow-pop-sm hover:shadow-pop",
                  ].join(" ")}
                >
                  {t.cta} →
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={[
                    "mt-7 inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5",
                    t.popular
                      ? "bg-coral text-white shadow-pop-sm hover:bg-coral/90"
                      : "bg-ink text-cream shadow-pop-sm hover:shadow-pop",
                  ].join(" ")}
                >
                  Dashboard →
                </Link>
              </SignedIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
