export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <div className="mb-6 h-9 w-24 animate-pulse rounded bg-white/10" />
        <div className="mb-2 h-8 w-3/4 animate-pulse rounded bg-white/10" />
        <div className="mb-6 h-4 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/5 bg-white/3 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-10 w-full animate-pulse rounded bg-white/10" />
                <div className="h-32 w-full animate-pulse rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
