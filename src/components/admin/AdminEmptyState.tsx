import { cn } from "@/lib/utils";

export default function AdminEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-white/8 flex flex-col items-center justify-center rounded-xl border py-16 text-center",
        className,
      )}
    >
      <p className="font-medium text-white">{title}</p>
      {description && (
        <p className="text-muted-foreground mt-1 text-sm">{description}</p>
      )}
    </div>
  );
}
