import Link from "next/link";
import { BackgroundLines } from "@/components/ui/background-lines";
import { Button } from "@/components/ui/button";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import { HydrateClient } from "@/trpc/server";
import {
  GithubIcon,
  BrainCircuit,
  Code2,
  GitBranch,
  Users,
} from "lucide-react";
import Image from "next/image";

export default async function Home() {
  const features = [
    {
      title: "GitHub Repository Intelligence",
      content:
        "Ask natural language questions about any GitHub repository. Get instant insights into code structure, dependencies, and contribution patterns. Our AI analyzes repositories in real-time, providing deep understanding of codebases.",
      image:
        "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Automated Documentation",
      content:
        "Generate comprehensive summaries and documentation for any codebase. Never waste time deciphering complex repositories again. Our AI creates clear, structured documentation that helps teams understand code faster.",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Meeting Intelligence",
      content:
        "Upload meeting recordings and get AI-powered summaries, action items, and searchable transcripts. Never miss a key discussion point. Transform your technical discussions into actionable insights.",
      image:
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  const stats = [
    { title: "Time Saved", value: "70%", desc: "in code review" },
    { title: "Projects Analyzed", value: "500+", desc: "and counting" },
    { title: "Meeting Hours", value: "1000+", desc: "summarized" },
    {
      title: "Developer Hours",
      value: "200+",
      desc: "saved per month",
    },
  ];

  return (
    <HydrateClient>
      <main className="relative min-h-screen overflow-hidden bg-black">
        <BackgroundLines
          className="absolute left-0 top-0 z-0 h-full w-full bg-black"
          children
        />

        {/* Hero Section */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <div className="relative inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
                SYNTHIA
                <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                  AI
                </div>
              </div>
            </div>

            <h1 className="mb-6 text-5xl font-bold text-white md:text-7xl">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Supercharge Your
              </span>
              <br />
              GitHub Workflow with AI
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-400">
              Synthia transforms how developers work with GitHub repositories
              and meetings. AI-powered insights, automated documentation, and
              intelligent analysis - all in one seamless platform.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button className="group relative rounded-lg bg-indigo-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-indigo-700">
                  <span className="mr-2 inline-block transition-transform group-hover:-translate-y-1">
                    <GithubIcon className="h-5 w-5" />
                  </span>
                  Get Started Free
                </Button>
              </Link>
              <Link href="/documentation">
                <Button
                  variant="outline"
                  className="rounded-lg px-8 py-4 text-lg"
                >
                  View Documentation
                </Button>
              </Link>
            </div>

            {/* Stats Grid */}
            <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="cursor-default rounded-xl border border-gray-800 bg-black/50 p-6 backdrop-blur hover:border-blue-500/50"
                >
                  <div className="cursor-default text-3xl font-bold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-2 cursor-default text-sm text-gray-400">
                    {stat.title}
                  </div>
                  <p className="text-sm text-white/60">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="group cursor-default rounded-2xl border border-gray-800 bg-black/50 p-8 backdrop-blur transition-all hover:border-indigo-500/50 hover:bg-black/60">
              <div className="mb-4 inline-block rounded-lg bg-indigo-500/10 p-3">
                <Code2 className="h-6 w-6 text-indigo-500" />
              </div>
              <h3 className="mb-3 cursor-default text-xl font-semibold text-white">
                Code Analysis
              </h3>
              <p className="cursor-default text-gray-400">
                Deep insights into your codebase with AI-powered analysis and
                recommendations.
              </p>
            </div>
            <div className="group cursor-default rounded-2xl border border-gray-800 bg-black/50 p-8 backdrop-blur transition-all hover:border-indigo-500/50 hover:bg-black/60">
              <div className="mb-4 inline-block rounded-lg bg-purple-500/10 p-3">
                <GitBranch className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="mb-3 cursor-default text-xl font-semibold text-white">
                Smart Git
              </h3>
              <p className="cursor-default text-gray-400">
                Intelligent branch management and merge conflict resolution
                powered by AI.
              </p>
            </div>
            <div className="group cursor-default rounded-2xl border border-gray-800 bg-black/50 p-8 backdrop-blur transition-all hover:border-indigo-500/50 hover:bg-black/60">
              <div className="mb-4 inline-block rounded-lg bg-emerald-500/10 p-3">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <h3 className="mb-3 cursor-default text-xl font-semibold text-white">
                Team Sync
              </h3>
              <p className="cursor-default text-gray-400">
                Keep your team aligned with AI-generated meeting summaries and
                action items.
              </p>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-24 text-center">
            <div className="inline-flex items-center gap-x-2 rounded-full border border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500"></span>
              </span>
              <span className="font-medium text-gray-300">
                Trusted by 10,000+ developers worldwide
              </span>
            </div>
          </div>
        </div>

        {/* Gradient Bottom */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-black to-transparent"></div>
      </main>
    </HydrateClient>
  );
}
