"use client";

export default function LoadingSkeleton() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top section: Twin visual + sidebar */}
      <div className="flex flex-1 min-h-0">
        {/* Twin visual placeholder */}
        <div className="flex-1 bg-bg p-3 space-y-3">
          <div className="h-6 w-40 bg-muted/20 rounded animate-pulse" />
          <div className="h-48 bg-muted/10 rounded-lg animate-pulse" />
          <div className="flex gap-3">
            <div className="h-20 flex-1 bg-muted/10 rounded animate-pulse" />
            <div className="h-20 flex-1 bg-muted/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Sidebar placeholder */}
        <div className="hidden sm:block w-56 md:w-64 bg-surface border-l border-border p-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
              <div className="h-5 w-full bg-muted/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Terminal placeholder */}
      <div className="h-[45%] sm:h-[40%] shrink-0 border-t-2 border-muted/30 bg-terminal p-3 space-y-3">
        <div className="h-4 w-64 bg-terminal-text/10 rounded animate-pulse" />
        <div className="h-4 w-48 bg-terminal-text/10 rounded animate-pulse" />
        <div className="h-4 w-56 bg-terminal-text/10 rounded animate-pulse" />
        <div className="mt-auto h-8 w-full bg-terminal-input rounded animate-pulse" />
      </div>
    </div>
  );
}
