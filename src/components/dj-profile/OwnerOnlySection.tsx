import type { ReactNode } from "react";
import type { ViewMode } from "@/types/dj-demo";

type Props = {
  viewMode: ViewMode;
  children: ReactNode;
  fallback?: ReactNode;
};

export function OwnerOnlySection({ viewMode, children, fallback = null }: Props) {
  if (viewMode !== "dj-owner") return <>{fallback}</>;
  return <>{children}</>;
}
