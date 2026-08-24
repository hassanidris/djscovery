import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-h_blackLight/40 gap-0 overflow-visible border-white/8 p-6">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
      <Separator className="mb-5 bg-white/8" />
      {children}
    </Card>
  );
}
