import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/50 animate-pulse rounded-md",
        "bg-linear-to-r from-gray-800 via-gray-700 to-gray-800",
        "bg-size-[200%_100%]",
        "animate-[shimmer_1.5s_infinite]",
        className,
      )}
      style={{
        background:
          "linear-gradient(90deg, var(--charcoal-light) 25%, var(--charcoal) 50%, var(--charcoal-light) 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
      }}
      {...props}
    />
  );
}

export { Skeleton };
