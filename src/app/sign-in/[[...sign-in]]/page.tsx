"use client";

import { SignIn } from "@clerk/nextjs";
import { 
  ArrowRight, 
  Sparkles, 
  Code2, 
  Cpu, 
  Zap,
  CheckCircle2,
  Lock
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Left Side: Brand & Visuals (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-ink">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-coral/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky/20 blur-[120px]" />
          <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-butter/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors">
              <Logo width={32} height={32} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight text-center">OwnYourCode</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
              Engineering intelligence, <br />
              <span className="font-display italic text-coral">delivered at scale.</span>
            </h2>
            <p className="text-lg text-cream/70 mb-10 leading-relaxed font-medium">
              Join 10k+ developers building faster with our AI&apos;s semantic understanding of your codebase.
            </p>

            <div className="space-y-6">
              {[
                { icon: Code2, title: "Deep Context", desc: "Understand architecture, not just snippets." },
                { icon: Cpu, title: "Model Agnostic", desc: "Switch between state-of-the-art LLMs." },
                { icon: Lock, title: "Enterprise Ready", desc: "Your data is encrypted and never trained on." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="size-5 text-coral" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-0.5">{item.title}</h4>
                    <p className="text-cream/60 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <p className="text-cream/50 text-xs font-medium">© 2026 OwnYourCode AI Inc.</p>
          <div className="h-px flex-1 bg-white/5" />
          <div className="flex gap-4">
             <div className="size-2 rounded-full bg-white/10" />
             <div className="size-2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* ── Right Side: Sign In Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-cream">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
             <div className="bg-ink p-3 rounded-2xl mb-4 shadow-xl">
               <Logo width={40} height={40} />
             </div>
             <h1 className="text-3xl font-bold text-ink leading-none">OwnYourCode</h1>
             <p className="text-ink-soft mt-2">Sign in to your account</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full">
              <SignIn
                appearance={{
                  variables: {
                    colorPrimary: "#e2614a", // approximation of coral
                    colorText: "#22252a", // ink
                    colorTextSecondary: "#525760", // ink-soft
                    colorBackground: "#f9f8f6", // cream
                    colorInputBackground: "#f1f0ec", // cream-deep
                    colorInputText: "#22252a",
                    borderRadius: "1rem",
                  },
                  elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-soft bg-white border border-ink/10 rounded-3xl p-4",
                    headerTitle: "text-2xl font-bold tracking-tight text-ink",
                    headerSubtitle: "text-ink-soft font-medium",
                    socialButtonsBlockButton: "bg-white border-ink/10 shadow-sm hover:bg-cream text-ink transition-all font-medium",
                    dividerLine: "bg-ink/10",
                    dividerText: "text-ink-soft text-xs",
                    formFieldLabel: "text-ink font-semibold mb-1.5",
                    formFieldInput: "bg-cream-deep border-ink/10 focus:border-coral focus:ring-4 focus:ring-coral/10 transition-all",
                    formButtonPrimary: "bg-ink hover:bg-ink-soft text-cream font-bold h-11 shadow-pop-sm transition-all active:scale-[0.98]",
                    footer: "hidden",
                    identityPreviewText: "text-ink font-medium",
                    identityPreviewEditButton: "text-coral hover:text-coral-soft font-bold",
                  },
                }}
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/sync-user"
              />
            </div>
          </motion.div>

          <p className="text-center text-sm text-ink-soft">
            Don&apos;t have an account?{" "}
            <Link 
              href="/sign-up" 
              className="font-bold text-coral hover:text-coral-soft underline underline-offset-4 transition-colors"
            >
              Sign up for free
            </Link>
          </p>

          <div className="pt-8 grid grid-cols-2 gap-4">
             <div className="flex flex-col items-center gap-1">
               <span className="text-lg font-bold text-ink">256-bit</span>
               <span className="text-[10px] text-ink-soft uppercase tracking-widest font-bold">Encryption</span>
             </div>
             <div className="flex flex-col items-center gap-1 border-l border-ink/10">
               <span className="text-lg font-bold text-ink">ISO</span>
               <span className="text-[10px] text-ink-soft uppercase tracking-widest font-bold">Certified</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
