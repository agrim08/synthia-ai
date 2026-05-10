const logos = ["Stripe", "Vercel", "Linear", "Notion", "Figma", "Supabase", "Raycast", "Arc"];

export function LogoStrip() {
  const all = [...logos, ...logos];
  return (
    <section className="border-y border-ink/5 bg-cream-deep/40 py-10">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
        Trusted by engineering teams at
      </p>
      <div className="ticker-mask mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee gap-14 pr-14">
          {all.map((name, i) => (
            <span
              key={i}
              className="font-display text-3xl text-ink/40 transition-colors hover:text-ink"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
