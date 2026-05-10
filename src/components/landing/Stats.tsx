const stats = [
  { value: "70%", label: "Time saved on code reviews" },
  { value: "5k+", label: "Repositories analyzed monthly" },
  { value: "1M+", label: "Insights generated to date" },
  { value: "+45%", label: "Average team productivity lift" },
];

export function Stats() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl rounded-[2.5rem] border border-ink/10 bg-ink p-10 text-cream shadow-pop md:p-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Numbers that{" "}
            <span className="font-display italic text-coral">speak</span> for themselves.
          </h2>
          <p className="mt-4 text-cream/70">
            Real outcomes from teams shipping with OwnYourCode every day.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="group rounded-2xl border border-cream/10 bg-cream/[0.04] p-6 transition-all hover:bg-cream/[0.08]"
            >
              <div
                className="font-display text-5xl text-coral transition-transform group-hover:scale-105 md:text-6xl"
                style={{ transitionDelay: `${i * 30}ms` }}
              >
                {s.value}
              </div>
              <div className="mt-3 text-sm text-cream/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
