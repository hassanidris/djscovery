export default function Loading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-4 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-8 h-64 animate-pulse rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}