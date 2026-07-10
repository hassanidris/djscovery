import type { ReactNode } from "react";

export default function ComingSoonShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 py-20">
      {children}
    </div>
  );
}
