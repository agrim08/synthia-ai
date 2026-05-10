import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "OwnYourCode cut our onboarding time in half. New devs understand the entire codebase on day one.",
    name: "Priya Mehta",
    role: "Engineering Lead, Kira Systems",
    avatar: "PM",
    color: "bg-coral-soft",
  },
  {
    quote:
      "I asked it to explain our auth flow and it gave a cleaner answer than our own wiki. Surreal.",
    name: "James O'Brien",
    role: "Senior SWE, Layers",
    avatar: "JO",
    color: "bg-sky",
  },
  {
    quote:
      "Documentation that used to take days now takes minutes. This is the future of engineering.",
    name: "Seo-yeon Park",
    role: "CTO, Relay",
    avatar: "SP",
    color: "bg-butter",
  },
];

export function Testimonials() {
  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink">
            <Star className="h-3 w-3 fill-coral text-coral" />
            Loved by builders
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Engineering teams are{" "}
            <span className="font-display italic text-coral">obsessed</span>.
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              className="hover-lift relative rounded-3xl border border-ink/10 bg-white p-6 shadow-pop-sm hover:shadow-pop"
              style={{ transform: `rotate(${i % 2 === 0 ? "-1" : "1"}deg)` }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-coral text-coral" />
                ))}
              </div>
              <blockquote className="mt-4 text-lg leading-relaxed text-ink">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full ${t.color} text-sm font-bold text-ink shadow-pop-sm`}
                >
                  {t.avatar}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.name}</div>
                  <div className="text-xs text-ink-soft">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
