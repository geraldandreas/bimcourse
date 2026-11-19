export default function CourseLearnLoading() {
  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0D1117] text-gray-900 dark:text-[#E6EDF3] overflow-hidden font-sans transition-colors duration-200">
      {/* Top Navbar Skeleton */}
      <header className="h-14 sm:h-16 shrink-0 border-b border-black/10 dark:border-white/10 bg-white dark:bg-[#161B22] px-4 sm:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-4 w-48 sm:w-72 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="h-8 w-14 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Skeleton */}
        <aside className="w-80 sm:w-96 shrink-0 border-r border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#161B22]/95 flex flex-col p-4 space-y-4">
          <div className="h-9 w-full rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-3 w-16 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>
          <div className="space-y-3 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] space-y-2.5 animate-pulse"
              >
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10" />
                <div className="h-3 w-1/2 rounded bg-gray-200/70 dark:bg-white/5" />
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content Reader Pane Skeleton */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0D1117] p-6 sm:p-12 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 rounded-full bg-amber-500/20" />
              <div className="h-5 w-20 rounded-full bg-gray-200 dark:bg-white/10" />
            </div>
            <div className="h-9 sm:h-11 w-3/4 rounded-2xl bg-gray-200 dark:bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-gray-200/80 dark:bg-white/5" />

            <div className="space-y-3 pt-6 border-t border-black/5 dark:border-white/5">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-4/6 rounded bg-gray-200 dark:bg-white/10" />
            </div>

            {/* Interactive Card Shimmer */}
            <div className="p-6 rounded-3xl border border-black/5 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02] space-y-4">
              <div className="h-6 w-48 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-4 w-full rounded bg-gray-200/70 dark:bg-white/5" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-16 rounded-2xl bg-gray-200 dark:bg-white/10" />
                <div className="h-16 rounded-2xl bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
