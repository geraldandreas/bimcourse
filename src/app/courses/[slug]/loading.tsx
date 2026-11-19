export default function CourseDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0C0E12] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navbar mock */}
      <div className="h-16 border-b border-black/5 dark:border-white/10 bg-white dark:bg-[#12161E] px-4 sm:px-8 flex items-center justify-between">
        <div className="h-7 w-32 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="h-9 w-28 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
      </div>

      {/* Hero Header Skeleton */}
      <section className="bg-white dark:bg-[#12161E] border-b border-black/5 dark:border-white/10 py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-8 space-y-5 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-6 w-24 rounded-full bg-emerald-500/20" />
                <div className="h-6 w-28 rounded-full bg-gray-200 dark:bg-white/10" />
              </div>
              <div className="h-10 sm:h-12 w-4/5 rounded-2xl bg-gray-200 dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200/80 dark:bg-white/5" />
                <div className="h-4 w-5/6 rounded bg-gray-200/80 dark:bg-white/5" />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 rounded bg-gray-200 dark:bg-white/10" />
                  <div className="h-3 w-24 rounded bg-gray-200/70 dark:bg-white/5" />
                </div>
              </div>
            </div>

            {/* Sticky Card Skeleton */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-4 animate-pulse">
              <div className="h-44 rounded-2xl bg-gray-200 dark:bg-white/10" />
              <div className="h-8 w-36 rounded-xl bg-gray-200 dark:bg-white/10" />
              <div className="h-12 w-full rounded-2xl bg-emerald-500/20" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs & Modules Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="h-10 w-80 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-white/[0.03] border border-black/5 dark:border-white/10 space-y-3 animate-pulse"
            >
              <div className="h-5 w-1/2 rounded bg-gray-200 dark:bg-white/10" />
              <div className="h-3.5 w-1/3 rounded bg-gray-200/70 dark:bg-white/5" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
