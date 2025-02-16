"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import {
  Github,
  Mic,
  CreditCard,
  Zap,
  ChevronRight,
  ExternalLink,
  Brain,
  Code,
  Rocket as RocketLaunch,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <motion.div {...fadeIn} className="container mx-auto px-4 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-6xl font-bold">
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Synthia AI
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-white/60">
            Your intelligent companion for GitHub repository analysis, code
            understanding, and meeting summarization. Built for developers who
            value efficiency and precision.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href={"/"}>
              <Button
                className="border-white/20 text-white hover:bg-white/10"
                variant={"outline"}
              >
                <ChevronLeft className="ml-2 h-4 w-4" /> Back to home
              </Button>
            </Link>
            <Link href={"/dashboard"}>
              <Button className="bg-white text-black hover:bg-white/90">
                Get Started <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              asChild
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <a
                href="https://github.com/agrim08/synthia-ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub <Github className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { title: "Time Saved", value: "70%", desc: "in code review" },
            { title: "Projects Analyzed", value: "500+", desc: "and counting" },
            { title: "Meeting Hours", value: "1000+", desc: "summarized" },
            {
              title: "Developer Hours",
              value: "200+",
              desc: "saved per month",
            },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              className="rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <p className="mb-2 text-3xl font-bold text-white">
                {metric.value}
              </p>
              <p className="mb-1 text-lg font-medium text-white/80">
                {metric.title}
              </p>
              <p className="text-sm text-white/60">{metric.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Features Deep Dive */}
        <motion.section {...fadeIn} className="mb-20">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Features Deep Dive
          </h2>

          <div className="space-y-20">
            {/* GitHub Analysis */}
            <Card className="border-white/10 bg-white/5 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center">
                    <Github className="mr-3 h-8 w-8 text-white" />
                    <h3 className="text-2xl font-bold">
                      AI-Powered GitHub Analysis
                    </h3>
                  </div>
                  <div className="space-y-4 text-white/80">
                    <p className="text-lg">
                      Instantly understand complex codebases through AI-driven
                      insights:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Comprehensive summaries of last 15 commits</li>
                      <li>
                        File-by-file analysis with contextual understanding
                      </li>
                      <li>Development workflow pattern identification</li>
                      <li>70% reduction in code review time</li>
                    </ul>
                  </div>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-white/10">
                  <Image
                    src="/github-docs.png"
                    alt="GitHub Analysis Demo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </Card>

            {/* RAG Pipeline */}
            <Card className="border-white/10 bg-white/5 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="relative order-2 aspect-video overflow-hidden rounded-lg bg-white/10 md:order-1">
                  <Image
                    src="/rag-docs-2nd.png"
                    alt="RAG Pipeline Demo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="order-1 md:order-2">
                  <div className="mb-4 flex items-center">
                    <Brain className="mr-3 h-8 w-8 text-white" />
                    <h3 className="text-2xl font-bold">
                      Codebase Q&A with RAG Pipeline
                    </h3>
                  </div>
                  <div className="space-y-4 text-white/80">
                    <p className="text-lg">
                      Hallucination-free answers powered by LangChain.js +
                      Gemini API:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Precise code snippet references</li>
                      <li>Maintained conversation history</li>
                      <li>Context-aware responses</li>
                      <li>Integration with existing documentation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Meeting Intelligence */}
            <Card className="border-white/10 bg-white/5 p-8">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <div className="mb-4 flex items-center">
                    <Mic className="mr-3 h-8 w-8 text-white" />
                    <h3 className="text-2xl font-bold">Meeting Intelligence</h3>
                  </div>
                  <div className="space-y-4 text-white/80">
                    <p className="text-lg">
                      Transform meetings into actionable insights:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>5 key takeaways per meeting</li>
                      <li>Assigned action items with owner tracking</li>
                      <li>Word-level timestamp searching</li>
                      <li>Automated follow-up generation</li>
                    </ul>
                  </div>
                </div>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-white/10">
                  <Image
                    src="/meeting-analytics.png"
                    alt="Meeting Intelligence Demo"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Tech Stack & Pricing */}
        <motion.section {...fadeIn} className="mb-20 grid gap-8 md:grid-cols-2">
          <Card className="border-white/10 bg-white/5 p-8">
            <h3 className="mb-6 flex items-center text-2xl font-bold">
              <Code className="mr-2 h-6 w-6" />
              Technology Stack
            </h3>
            <div className="space-y-6">
              {[
                { tech: "T3 Stack", desc: "Type-safe full-stack framework" },
                { tech: "Clerk", desc: "Pre-built auth components" },
                { tech: "Neon DB", desc: "Serverless PostgreSQL" },
                { tech: "Langchain.js", desc: "Modular RAG pipeline" },
                { tech: "Firebase", desc: "Scalable storage solution" },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Zap className="mt-1 h-5 w-5 text-white/60" />
                  <div>
                    <p className="font-medium">{item.tech}</p>
                    <p className="text-sm text-white/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/10 bg-white/5 p-8">
            <h3 className="mb-6 flex items-center text-2xl font-bold">
              <CreditCard className="mr-2 h-6 w-6" />
              Transparent Pricing
            </h3>
            <div className="space-y-6">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="mb-2 text-xl font-semibold">1 Credit = ₹1</p>
                <p className="text-white/60">Simple, straightforward pricing</p>
              </div>
              <div className="space-y-3">
                <p className="font-medium">What you get:</p>
                <ul className="space-y-2 text-white/80">
                  <li className="flex items-center">
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-white/60"></span>
                    1 credit per file analyzed
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2 h-1.5 w-1.5 rounded-full bg-white/60"></span>
                    Unlimited project storage
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.section>

        {/* Future Roadmap */}
        <motion.section {...fadeIn} className="mb-20">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Future Roadmap
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quarter: "Q2 2025",
                feature: "Team Knowledge Base",
                desc: "AI-powered insights from chat history",
              },
              {
                quarter: "Q3 2025",
                feature: "RFC Generator",
                desc: "Automated technical documentation from meetings",
              },
              {
                quarter: "Q4 2025",
                feature: "Job Assistant",
                desc: "AI powered resume building and mock interview platform",
              },
            ].map((item, i) => (
              <Card key={i} className="border-white/10 bg-white/5 p-6">
                <p className="mb-2 text-white/60">{item.quarter}</p>
                <h3 className="mb-2 text-xl font-bold">{item.feature}</h3>
                <p className="text-white/80">{item.desc}</p>
              </Card>
            ))}
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.div
          {...fadeIn}
          className="rounded-lg bg-gradient-to-b from-white/10 to-white/5 p-12 text-center"
        >
          <h2 className="mb-4 text-3xl font-bold">
            Ready to Transform Your Development Workflow?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-white/60">
            Join forward-thinking developers who are using Synthia AI to build
            better software, faster.
          </p>
          <Link href={"/dashboard"}>
            <Button className="bg-white text-black hover:bg-white/90">
              Get Started Now <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
