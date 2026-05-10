import { useState } from "react";
import { Plus } from "lucide-react";

const faqs = [
  {
    q: "How does the credit system work?",
    a: "OwnYourCode uses a simple pay-as-you-go model. 1 credit equals 1 file indexed. There are no monthly subscriptions — top up whenever you need more intelligence fuel.",
  },
  {
    q: "How secure is my code?",
    a: "Your code never leaves your control. We use end-to-end encryption and SOC 2 Type II compliant infrastructure. Read-only access by default.",
  },
  {
    q: "Do credits ever expire?",
    a: "No. Credits stay in your account until you use them. No time limit, no recurring fee, no expiry.",
  },
  {
    q: "Does it support private repos?",
    a: "Yes — GitHub, GitLab, and Bitbucket, via secure OAuth or personal access tokens.",
  },
  {
    q: "Can I cancel anytime?",
    a: "There's nothing to cancel — it's pay-as-you-go. Use the credits you bought, or don't. Your call.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs font-semibold text-ink">
            FAQ
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Common <span className="font-display italic text-coral">questions</span>.
          </h2>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={[
                  "overflow-hidden rounded-2xl border transition-all",
                  isOpen ? "border-ink bg-white shadow-pop-sm" : "border-ink/10 bg-white/60",
                ].join(" ")}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base font-semibold text-ink">{f.q}</span>
                  <Plus
                    className={[
                      "h-5 w-5 shrink-0 text-ink transition-transform duration-300",
                      isOpen ? "rotate-45" : "rotate-0",
                    ].join(" ")}
                  />
                </button>
                <div
                  className="grid transition-all duration-500"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
