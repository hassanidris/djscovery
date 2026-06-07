import Link from "next/link";
import React from "react";

const NotFound = () => {
  return (
    <section className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-h_red/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* 404 */}
        <p className="font-heading text-[9rem] sm:text-[12rem] leading-none text-white/5 select-none tracking-tight">
          404
        </p>

        {/* Icon row */}
        <div className="flex items-center gap-3 -mt-6 mb-6">
          <div className="h-px w-12 bg-white/10" />
          <span className="text-2xl">🎧</span>
          <div className="h-px w-12 bg-white/10" />
        </div>

        {/* Heading */}
        <h1 className="font-heading text-2xl sm:text-3xl text-white mb-3">
          This track doesn&apos;t exist
        </h1>

        {/* Body */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
          The page you&apos;re looking for has been dropped from the setlist.
          Head back to the main stage.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-h_red hover:bg-h_redDark text-white text-sm font-semibold transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-white/15 text-gray-300 hover:bg-white/5 text-sm font-semibold transition-colors"
          >
            Browse DJs
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
