"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Logo } from "@/components/Logo";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 py-24 sm:py-32 antialiased">
      {/* Subtle mesh background from landing page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(243 75% 96%) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 60%, hsl(260 80% 95%) 0%, transparent 60%)",
        }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Logo width={40} height={40} />
            <span className="text-[20px] font-bold tracking-tight text-slate-900">OwnYourCode</span>
          </Link>
        </div>

        <div className="relative inline-block">
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-[clamp(6rem,15vw,10rem)] font-extrabold tracking-tighter text-slate-900 leading-none"
          >
            404
          </motion.h1>
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-sm"
          >
             <Search className="h-6 w-6 text-indigo-600" />
          </motion.div>
        </div>

        <h2 className="mt-4 text-[clamp(1.5rem,4vw,2.5rem)] font-extrabold tracking-tight text-slate-900">
          Lost in the <span className="text-indigo-600">codebase?</span>
        </h2>
        
        <p className="mt-6 text-[16px] leading-relaxed text-slate-500 max-w-md mx-auto">
          Even the best AI gets lost sometimes. The page you&apos;re looking for doesn&apos;t exist or has been moved to a new repository.
        </p>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/">
            <Button
              size="lg"
              className="h-12 rounded-xl bg-indigo-600 px-8 text-[15px] font-semibold text-white shadow-lg shadow-indigo-200/60 hover:bg-indigo-700 transition-all hover:shadow-indigo-300/60 hover:-translate-y-px"
            >
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            size="lg"
            className="h-12 rounded-xl border border-slate-200 px-8 text-[15px] font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </motion.div>

      {/* Decorative dots grid background */}
      <div className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />
      
      {/* Footer text */}
      <div className="absolute bottom-8 text-center w-full">
        <p className="text-[12px] text-slate-400 font-medium tracking-wide uppercase">
          OwnYourCode AI Intelligence Layer
        </p>
      </div>
    </main>
  );
}
