import { Github, Folder, Search, ArrowRight, Terminal, Clock, CreditCard, Sparkles } from "lucide-react";

export function InstantIndexingMockup() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0a0a0a] overflow-hidden p-6">
      {/* Radial Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="h-[300px] w-[300px] rounded-full bg-sage/20 blur-[80px]" />
      </div>
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] p-5">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
            <Github className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Connect Repository</h3>
            <p className="text-xs text-white/50">Import a project to index</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/60">Project Name</label>
            <div className="flex w-full items-center rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <Folder className="mr-2 h-4 w-4 text-white/40" />
              <span className="text-sm text-white">hyper-scale-backend</span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-white/60">GitHub URL</label>
            <div className="flex w-full items-center rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <Search className="mr-2 h-4 w-4 text-white/40" />
              <span className="text-sm text-white">github.com/oss-labs/core-engine</span>
            </div>
          </div>
        </div>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-[0.98]">
          Start Indexing <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function ChatCodebaseMockup() {
  return (
    <div className="relative flex h-full w-full flex-col bg-[#0a0a0a] overflow-hidden p-6 md:p-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 right-0 h-[300px] w-[300px] rounded-full bg-sky/20 blur-[100px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col gap-4 max-w-2xl mx-auto w-full mt-4 justify-center">
        {/* User Query */}
        <div className="self-end rounded-2xl rounded-tr-sm bg-sky px-4 py-2.5 text-sm font-medium text-white shadow-lg max-w-[85%]">
          How is authentication handled in this repo?
        </div>
        
        {/* AI Response */}
        <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral/20 border border-coral/30 mt-1">
            <Sparkles className="h-4 w-4 text-coral" />
          </div>
          <div className="flex-1 rounded-2xl rounded-tl-sm border border-white/[0.08] bg-[#0a0a0a]/90 backdrop-blur-md p-5 shadow-xl">
            <h4 className="text-[10px] font-bold tracking-wider text-white/40 uppercase mb-3">Core Concept</h4>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              Authentication is managed via NextAuth (Auth.js) in the <span className="font-mono text-coral bg-coral/10 px-1 py-0.5 rounded">src/auth.ts</span> configuration file, utilizing JWT strategies and OAuth providers.
            </p>
            
            <div className="overflow-hidden rounded-lg border border-white/[0.05] bg-black/60 hidden sm:block">
              <div className="flex items-center border-b border-white/[0.05] bg-white/[0.02] px-3 py-1.5">
                <Terminal className="h-3 w-3 text-white/40 mr-2" />
                <span className="text-[10px] text-white/40 font-mono">auth.ts</span>
              </div>
              <div className="p-3 overflow-x-auto">
                <pre className="text-[11px] font-mono leading-relaxed text-white/70">
                  <span className="text-purple-400">export</span> <span className="text-blue-400">const</span> {"{"} handlers, auth, signIn {"}"} <span className="text-purple-400">=</span> <span className="text-yellow-200">NextAuth</span>{"({\n"}
                  {"  "}providers: [ <span className="text-yellow-200">GitHub</span>{"({ ... })"} ],{"\n"}
                  {"  "}session: {"{ "}strategy: <span className="text-green-300">"jwt"</span>{" }"}{"\n"}
                  {"})"}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommitIntelligenceMockup() {
  const commits = [
    { hash: "cc634e9", title: "fix: resolve race condition in auth state", time: "2h ago", type: "bug" },
    { hash: "8f92a1b", title: "feat: implement dark mode UI palette", time: "5h ago", type: "ui" },
    { hash: "1a2b3c4", title: "chore: update dependencies", time: "1d ago", type: "chore" },
  ];

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0a0a0a] overflow-hidden p-6 md:p-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute left-10 top-1/2 h-[250px] w-[250px] -translate-y-1/2 rounded-full bg-coral-soft/20 blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-2xl flex flex-col gap-5">
        
        {/* Timeline */}
        <div className="flex flex-col gap-4 relative">
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/[0.08]" />
          
          {commits.map((commit, i) => (
            <div key={commit.hash} className="flex gap-4 relative z-10">
              <div className="mt-1 shrink-0 h-5 w-5 rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] flex items-center justify-center">
                <div className={`h-2 w-2 rounded-full ${commit.type === 'bug' ? 'bg-red-400' : commit.type === 'ui' ? 'bg-sky' : 'bg-white/30'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-white/[0.05] bg-white/[0.03] text-white/70">{commit.hash}</span>
                    <span className="text-xs text-white/40 flex items-center gap-1"><Clock className="h-3 w-3" />{commit.time}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-white/90">{commit.title}</p>
                
                {i === 0 && (
                  <div className="mt-3 rounded-lg border border-coral-soft/30 bg-coral-soft/10 p-3 shadow-inner">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-3 w-3 text-coral-soft" />
                      <span className="text-[10px] font-bold tracking-wider text-coral-soft uppercase">AI Summary</span>
                    </div>
                    <p className="text-xs text-coral-soft/90 leading-relaxed">
                      Fixed an issue where the session token was evaluated before the hydration cycle completed, preventing stale reads on the login view.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TransparentBillingMockup() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[#0a0a0a] overflow-hidden p-6 md:p-10">
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-[-20%] right-[-10%] h-[300px] w-[300px] rounded-full bg-butter/20 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Left Column */}
        <div className="md:col-span-2 flex flex-col gap-4 h-full">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-md p-6 shadow-xl flex flex-col justify-between flex-1">
            <div className="flex items-center gap-2 text-white/60 mb-6">
              <CreditCard className="h-4 w-4 text-butter" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Current Balance</span>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white tracking-tight">184</span>
                <span className="text-lg font-medium text-white/50">credits</span>
              </div>
              <p className="text-xs text-white/40 mt-2">Refreshes in 12 days</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[10px] font-semibold text-white/40 uppercase mb-1">Last Indexed</div>
              <div className="text-sm font-medium text-white/80">3 hrs ago</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-[10px] font-semibold text-white/40 uppercase mb-1">Est. Runtime</div>
              <div className="text-sm font-medium text-white/80">~45 mins</div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="rounded-2xl border border-butter/20 bg-butter/5 backdrop-blur-md p-5 shadow-xl flex flex-col h-full">
          <h3 className="text-sm font-bold text-white mb-2">Need more?</h3>
          <p className="text-xs text-white/60 mb-6 flex-1">Top up your capacity for heavy indexing runs.</p>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/80">500 Credits</span>
              <span className="text-white font-medium">$5</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-white/80">2000 Credits</span>
              <span className="text-white font-medium">$15</span>
            </div>
          </div>

          <button className="w-full mt-auto rounded-lg bg-butter py-2.5 text-xs font-bold text-black transition-transform hover:scale-[0.98]">
            Purchase Credits
          </button>
        </div>

      </div>
    </div>
  );
}
