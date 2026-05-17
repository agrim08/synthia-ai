"use client";

import { SignUp } from "@clerk/nextjs";
import { 
  ArrowRight, 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Globe,
  Users2,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Left Side: Brand & Visuals (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-ink">
        {/* Animated Mesh Gradient Background - Different palette for Sign Up */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sage/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-coral/20 blur-[120px]" />
          <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-sky/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors">
              <Logo width={32} height={32} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">OwnYourCode</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
              Start building with <br />
              <span className="font-display italic text-sage">superpowers today.</span>
            </h2>
            <p className="text-lg text-cream/70 mb-10 leading-relaxed font-medium">
              Join the elite circle of developers using AI to ship higher quality code in half the time.
            </p>

            <div className="space-y-6">
              {[
                { icon: Rocket, title: "Instant Indexing", desc: "Get your entire codebase understood in seconds." },
                { icon: Users2, title: "Team Collaboration", desc: "Share insights and AI-generated docs effortlessly." },
                { icon: ShieldCheck, title: "Private by Design", desc: "Your code stays yours. Always private, always secure." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="size-5 text-sage" />
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

      {/* ── Right Side: Sign Up Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-cream">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
             <div className="bg-ink p-3 rounded-2xl mb-4 shadow-xl">
               <Logo width={40} height={40} />
             </div>
             <h1 className="text-3xl font-bold text-ink leading-none">OwnYourCode</h1>
             <p className="text-ink-soft mt-2">Create your free account</p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-full">
              <SignUp
                appearance={{
                  variables: {
                    colorPrimary: "#e2614a",
                    colorText: "#22252a",
                    colorTextSecondary: "#525760",
                    colorBackground: "#f9f8f6",
                    colorInputBackground: "#f1f0ec",
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
                    formFieldInput: "bg-cream-deep border-ink/10 focus:border-sage focus:ring-4 focus:ring-sage/10 transition-all",
                    formButtonPrimary: "bg-ink hover:bg-ink-soft text-cream font-bold h-11 shadow-pop-sm transition-all active:scale-[0.98]",
                    footer: "hidden",
                    identityPreviewText: "text-ink font-medium",
                    identityPreviewEditButton: "text-sage hover:text-sage font-bold",
                  },
                }}
                path="/sign-up"
                routing="path"
                signInUrl="/sign-in"
                afterSignInUrl="/sync-user"
              />
            </div>
          </motion.div>

          <p className="text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link 
              href="/sign-in" 
              className="font-bold text-coral hover:text-coral-soft underline underline-offset-4 transition-colors"
            >
              Sign in here
            </Link>
          </p>

          <div className="pt-8 flex items-center justify-center gap-8">
             <div className="flex items-center gap-2">
               <CheckCircle2 className="size-4 text-sage" />
               <span className="text-xs font-bold text-ink-soft">Free Tier Available</span>
             </div>
             <div className="flex items-center gap-2">
               <CheckCircle2 className="size-4 text-sage" />
               <span className="text-xs font-bold text-ink-soft">No Credit Card</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
