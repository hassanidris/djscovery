/**
 * GenreBadge — read-only genre display badge.
 *
 * Used across the app to show genres on DJ cards, event pages, profiles, etc.
 * Not for selection — use GenreSelector for that.
 */

export interface GenreBadgeProps {
  children: string;
  /** Visual variant to match the host context. */
  variant?: "red" | "zinc" | "gray" | "dark-red";
  /** Optional size variant. Default: "sm". */
  size?: "xs" | "sm" | "md";
  /** Optional className for additional styling (can override text color). */
  className?: string;
}

export function GenreBadge({
  children,
  variant = "red",
  size = "sm",
  className = "",
}: GenreBadgeProps) {
  const base = "rounded-full inline-flex items-center";

  const variantStyles = {
    red: "bg-h_redDark/60 text-red-300 border-0",
    zinc: "bg-white/5 border border-white/10 text-zinc-300",
    gray: "bg-white/8 text-gray-400 border-0",
    "dark-red": "bg-red-950/60 text-red-200 border-0",
  };

  const sizeStyles = {
    xs: "px-2 py-0.5 text-[11px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
