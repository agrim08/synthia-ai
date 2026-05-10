import { GitBranch, Sparkles, Zap } from "lucide-react";

const steps = [
  {
    title: "Connect your repo",
    desc: "Link GitHub or GitLab in one click. We start indexing the moment you're in.",
    icon: GitBranch,
    accent: "bg-coral-soft",
    pos: "rotate-[-3deg]",
  },
  {
    title: "AI reads everything",
    desc: "Semantic mapping of your logic, structure, and intent — every file, every commit.",
    icon: Sparkles,
    accent: "bg-sky",
    pos: "rotate-[2deg]",
  },
  {
    title: "Ask. Generate. Ship.",
    desc: "Ask anything. Generate docs. Get reviews. All from one warm little dashboard.",
    icon: Zap,
    accent: "bg-butter",
    pos: "rotate-[-1deg]",
  },
];

export function Steps() {
  return (
    <section id="how-it-works" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" />
            How it works
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Ship faster in <span className="font-display italic text-coral">three</span> simple steps.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`group hover-lift relative rounded-3xl border border-ink/10 bg-white p-6 shadow-pop-sm hover:shadow-pop`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-2xl ${step.accent} text-ink shadow-pop-sm transition-transform duration-500 group-hover:rotate-[-8deg] ${step.pos}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="font-display text-5xl text-ink/15">0{i + 1}</span>
                </div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
