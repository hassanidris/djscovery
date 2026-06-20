import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black px-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-h_red/5 absolute top-1/2 left-1/2 h-150 w-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* 404 */}
        <p className="font-heading text-[9rem] leading-none tracking-tight text-white/10 select-none sm:text-[12rem]">
          404
        </p>

        {/* Icon row */}
        <div className="-mt-6 mb-6 flex items-center gap-3">
          <div className="h-px w-12 bg-white/10" />
          <span className="text-2xl">🎧</span>
          <div className="h-px w-12 bg-white/10" />
        </div>

        {/* Heading */}
        <h1 className="font-heading mb-3 text-2xl text-white sm:text-3xl">
          This track doesn&apos;t exist
        </h1>

        {/* Body */}
        <p className="mb-8 max-w-sm text-sm leading-relaxed text-gray-500">
          The page you&apos;re looking for has been dropped from the setlist.
          Head back to the main stage.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bg-h_red hover:bg-h_redDark inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5"
          >
            Browse DJs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
