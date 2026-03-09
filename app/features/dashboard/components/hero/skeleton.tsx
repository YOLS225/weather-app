export function HeroSkeleton() {
  return (
    <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-slate-300 via-slate-200 to-slate-100 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 animate-pulse">
      <div className="p-6 md:p-10">
        {/* City + time */}
        <div className="flex justify-between mb-8">
          <div className="space-y-2">
            <div className="h-7 w-40 rounded-lg bg-white/30" />
            <div className="h-4 w-24 rounded bg-white/20" />
            <div className="h-4 w-32 rounded bg-white/20" />
          </div>
          <div className="h-7 w-20 rounded bg-white/20" />
        </div>

        {/* Icon + temp */}
        <div className="flex items-center gap-10 mb-8">
          <div className="size-28 rounded-full bg-white/20" />
          <div className="space-y-3">
            <div className="h-20 w-44 rounded-xl bg-white/30" />
            <div className="h-6 w-36 rounded bg-white/20" />
            <div className="h-4 w-24 rounded bg-white/15" />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/15" />
          ))}
        </div>
      </div>
    </section>
  )
}
