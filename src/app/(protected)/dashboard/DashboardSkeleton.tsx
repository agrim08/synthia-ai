import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* 1. Context Bar Skeleton */}
      <div className="sticky top-20 z-40 bg-[#f0f2f7]/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-3 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
             <Skeleton className="h-8 w-8 rounded-full" />
             <Skeleton className="h-8 w-32 rounded-lg" />
          </div>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <Skeleton className="size-8 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="w-full mx-auto px-6 py-8 space-y-6">
        {/* 2. Content Sections Skeleton */}
        <section className="space-y-8 pt-4">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-3">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-6 w-48" />
             </div>
          </div>
          
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white/50">
                <Skeleton className="size-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
