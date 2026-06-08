import { Skeleton } from "@/components/ui/skeleton";

// ── DJ Card Skeleton ──────────────────────────────────────────────────────────
export function DjCardSkeleton() {
  return (
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3 relative">
      <div className="flex items-center gap-3">
        <Skeleton className="w-14 h-14 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full rounded-md" />
    </div>
  );
}

// ── DJ Grid Skeleton ─────────────────────────────────────────────────────────
export function DjGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <DjCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Filter Panel Skeleton ────────────────────────────────────────────────────
export function FilterPanelSkeleton() {
  return (
    <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3">
      <Skeleton className="h-4 w-20 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
      <div className="flex flex-col gap-2 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
      <Skeleton className="h-px w-full rounded my-1" />
      <Skeleton className="h-4 w-24 rounded" />
      <Skeleton className="h-9 w-full rounded-md" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

// ── DJ Profile Skeleton ──────────────────────────────────────────────────────
export function DjProfileSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Cover image */}
      <Skeleton className="w-full h-52 md:h-72 rounded-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-8 w-full">
        {/* Avatar + header info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-14 mb-8 relative z-10">
          <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full ring-4 ring-black shrink-0" />
          <div className="flex flex-col gap-2 pb-1 flex-1">
            <Skeleton className="h-7 w-52 rounded" />
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-h_blackLight/50 rounded-xl p-3 flex flex-col gap-1.5"
            >
              <Skeleton className="h-6 w-12 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-h_blackLight/50 rounded-xl p-5 mb-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-16 rounded mb-1" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>

        {/* Media grid */}
        <div className="bg-h_blackLight/50 rounded-xl p-5 mb-4">
          <Skeleton className="h-4 w-24 rounded mb-4" />
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Skeleton ────────────────────────────────────────────────────────────
export function PostSkeleton({ showImage = false }: { showImage?: boolean }) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-h_blackLight/50 rounded-xl border border-gray-800/70">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-32 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>
      {showImage && <Skeleton className="w-full h-48 rounded-lg" />}
      <div className="flex gap-8 pt-1">
        <Skeleton className="h-4 w-14 rounded" />
        <Skeleton className="h-4 w-20 rounded" />
      </div>
    </div>
  );
}

// ── Feed Skeleton ────────────────────────────────────────────────────────────
export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} showImage={i === 1} />
      ))}
    </div>
  );
}

// ── Post Interaction Skeleton ─────────────────────────────────────────────────
export function PostInteractionSkeleton() {
  return (
    <div className="flex items-center gap-8 py-2 my-1">
      <Skeleton className="h-4 w-14 rounded" />
      <Skeleton className="h-4 w-20 rounded" />
    </div>
  );
}

// ── Comment Input Skeleton ────────────────────────────────────────────────────
export function CommentInputSkeleton() {
  return (
    <div className="flex items-center gap-4">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <Skeleton className="h-9 flex-1 rounded-xl" />
    </div>
  );
}

// ── AddPost Skeleton ─────────────────────────────────────────────────────────
export function AddPostSkeleton() {
  return (
    <div className="p-4 bg-h_blackLight/50 rounded-lg flex gap-4">
      <Skeleton className="w-12 h-12 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-lg" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
      </div>
    </div>
  );
}

// ── Right Panel Skeleton ─────────────────────────────────────────────────────
export function RightPanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-28 rounded mb-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-h_blackLight/50 rounded-xl p-4 flex flex-col gap-3">
        <Skeleton className="h-4 w-20 rounded mb-1" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ── User Info Card Skeleton ──────────────────────────────────────────────────
export function UserInfoCardSkeleton() {
  return (
    <div className="bg-h_blackLight/50 rounded-xl overflow-hidden">
      <Skeleton className="w-full h-24 rounded-none" />
      <div className="flex flex-col items-center gap-2 px-4 pb-4 -mt-8">
        <Skeleton className="w-16 h-16 rounded-full ring-4 ring-black shrink-0" />
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
        <div className="flex gap-6 mt-2 w-full justify-center">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-4 w-8 rounded" />
              <Skeleton className="h-3 w-12 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="h-8 w-full rounded-md mt-2" />
      </div>
    </div>
  );
}

// ── Profile Page Skeleton ─────────────────────────────────────────────────────
export function ProfilePageSkeleton() {
  return (
    <div className="px-4 md:px-8 lg:px-16 xl:px-32 2xl:px-64">
      <div className="flex gap-6 py-6">
        {/* Left sidebar placeholder */}
        <div className="hidden xl:block w-[20%]">
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>

        {/* Center */}
        <div className="w-full lg:w-[70%] xl:w-[50%]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center">
              <div className="w-full h-64 relative">
                <Skeleton className="w-full h-64 rounded-md" />
                <Skeleton className="w-32 h-32 rounded-full absolute right-0 left-0 m-auto -bottom-16 ring-4 ring-black" />
              </div>
              <Skeleton className="mt-20 mb-3 h-6 w-36 rounded" />
              <div className="flex justify-center items-center gap-12 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <Skeleton className="h-5 w-10 rounded" />
                    <Skeleton className="h-3 w-14 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <AddPostSkeleton />
            <FeedSkeleton count={2} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden xl:block w-[30%]">
          <div className="flex flex-col gap-4">
            <UserInfoCardSkeleton />
            <RightPanelSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Become DJ Form Skeleton ───────────────────────────────────────────────────
export function BecomeDjSkeleton() {
  return (
    <div className="min-h-[calc(100vh-96px)] px-4 py-12">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col items-center gap-3 mb-10 text-center">
          <Skeleton className="w-14 h-14 rounded-full" />
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-72 rounded" />
        </div>
        <div className="flex flex-col gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4"
            >
              <Skeleton className="h-5 w-40 rounded mb-1" />
              <Skeleton className="h-px w-full rounded" />
              <Skeleton className="h-12 w-full rounded-lg" />
              {i < 3 && <Skeleton className="h-12 w-full rounded-lg" />}
            </div>
          ))}
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ── Edit Profile Skeleton ────────────────────────────────────────────────────
export function EditProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-36 rounded" />
          <Skeleton className="h-3 w-48 rounded" />
        </div>
      </div>
      {/* Sections */}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-h_blackLight/40 border border-white/8 rounded-xl p-6 flex flex-col gap-4"
        >
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-px w-full rounded" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-9 w-full rounded-md" />
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
