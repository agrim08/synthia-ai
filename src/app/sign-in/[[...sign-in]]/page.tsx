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
    <div className="flex min-h-screen bg-white">
      {/* ── Left Side: Brand & Visuals (Desktop) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-[#0A0C10]">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white/5 p-2 rounded-xl border border-white/10 group-hover:border-white/20 transition-colors">
              <Logo width={32} height={38} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight text-center">Synthia</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] mb-6">
              Engineering intelligence, <br />
              <span className="text-indigo-400">delivered at scale.</span>
            </h2>
            <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
              Join 10k+ developers building faster with Synthia&apos;s semantic understanding of your codebase.
            </p>

            <div className="space-y-6">
              {[
                { icon: Code2, title: "Deep Context", desc: "Understand architecture, not just snippets." },
                { icon: Cpu, title: "Model Agnostic", desc: "Switch between state-of-the-art LLMs." },
                { icon: Lock, title: "Enterprise Ready", desc: "Your data is encrypted and never trained on." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <item.icon className="size-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-0.5">{item.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <p className="text-slate-500 text-xs font-medium">© 2026 Synthia AI Inc.</p>
          <div className="h-px flex-1 bg-white/5" />
          <div className="flex gap-4">
             <div className="size-2 rounded-full bg-white/10" />
             <div className="size-2 rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      {/* ── Right Side: Sign In Form ── */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 bg-slate-50/50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
             <div className="bg-slate-900 p-3 rounded-2xl mb-4 shadow-xl">
               <Logo width={40} height={48} />
             </div>
             <h1 className="text-3xl font-bold text-slate-900 leading-none">Synthia</h1>
             <p className="text-slate-500 mt-2">Sign in to your account</p>
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
                    colorPrimary: "#4F46E5",
                    colorText: "#1E293B",
                    colorTextSecondary: "#64748B",
                    colorBackground: "#FFFFFF",
                    colorInputBackground: "#F8FAFC",
                    colorInputText: "#0F172A",
                    borderRadius: "1rem",
                  },
                  elements: {
                    rootBox: "w-full",
                    card: "w-full shadow-xl shadow-slate-200/50 bg-white border border-slate-200 rounded-3xl p-4",
                    headerTitle: "text-2xl font-bold tracking-tight text-slate-900",
                    headerSubtitle: "text-slate-500 font-medium",
                    socialButtonsBlockButton: "bg-white border-slate-200 shadow-sm hover:bg-slate-50 text-slate-700 transition-all font-medium",
                    dividerLine: "bg-slate-100",
                    dividerText: "text-slate-400 text-xs",
                    formFieldLabel: "text-slate-700 font-semibold mb-1.5",
                    formFieldInput: "bg-slate-50 border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all",
                    formButtonPrimary: "bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 shadow-lg shadow-slate-900/10 transition-all active:scale-[0.98]",
                    footer: "hidden",
                    identityPreviewText: "text-slate-900 font-medium",
                    identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700 font-bold",
                  },
                }}
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/dashboard"
              />
            </div>
          </motion.div>

          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link 
              href="/sign-up" 
              className="font-bold text-indigo-600 hover:text-indigo-700 underline underline-offset-4 transition-colors"
            >
              Sign up for free
            </Link>
          </p>

          <div className="pt-8 grid grid-cols-2 gap-4">
             <div className="flex flex-col items-center gap-1">
               <span className="text-lg font-bold text-slate-900">256-bit</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Encryption</span>
             </div>
             <div className="flex flex-col items-center gap-1 border-l border-slate-200">
               <span className="text-lg font-bold text-slate-900">ISO</span>
               <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Certified</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
