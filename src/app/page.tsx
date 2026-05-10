"use client";

import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { LogoStrip } from "@/components/landing/LogoStrip";
import { Bento } from "@/components/landing/Bento";
import { Steps } from "@/components/landing/Steps";
import { Stats } from "@/components/landing/Stats";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { Faq } from "@/components/landing/Faq";
import { CtaFooter } from "@/components/landing/CtaFooter";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background font-sans text-foreground">
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <Bento />
        <Steps />
        <Stats />
        <Testimonials />
        <Pricing />
        <Faq />
      </main>
      <CtaFooter />
    </div>
  );
}