export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0C0E12] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Mock Navbar shimmer */}
      <div className="h-16 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#12161E] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
          <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 space-y-8 animate-in fade-in duration-300">
        {/* Profile Header Card Skeleton */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-white/10 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div className="h-7 w-48 mx-auto sm:mx-0 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="h-4 w-64 mx-auto sm:mx-0 rounded bg-gray-200/80 dark:bg-white/5 animate-pulse" />
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="h-6 w-32 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Profile Tabs Skeleton */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-100 dark:bg-white/5 border border-black/5 dark:border-white/10 w-fit overflow-x-auto max-w-full">
          <div className="h-9 w-28 rounded-xl bg-white dark:bg-white/15 shadow-xs animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-gray-200/70 dark:bg-white/5 animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-gray-200/70 dark:bg-white/5 animate-pulse" />
        </div>

        {/* Content Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 shadow-sm overflow-hidden p-5 space-y-4"
            >
              <div className="h-40 w-full rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-gray-200/80 dark:bg-white/5 animate-pulse" />
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="h-8 w-24 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
