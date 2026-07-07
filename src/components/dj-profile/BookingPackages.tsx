"use client";

import { SectionHeading } from "./dj-profile-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { getCurrencyByCode } from "@/config/currencies";

type Package = {
  id: number;
  name: string;
  priceFrom: number;
  priceTo?: number | null;
  currency: string;
  duration?: string | null;
  features: string[];
  popular: boolean;
  icon?: LucideIcon;
};

type Props = {
  packages: Package[];
  onEnquire?: (packageName: string, priceFrom: number) => void;
  openBookingModal?: (packageName?: string, packagePrice?: number) => void;
};

export default function BookingPackages({
  packages,
  onEnquire,
  openBookingModal,
}: Props) {
  if (!packages || packages.length === 0) {
    return null;
  }

  const formatPrice = (
    priceFrom: number,
    currency: string,
    priceTo?: number | null,
  ) => {
    const currencyData = getCurrencyByCode(currency);
    const symbol = currencyData?.symbol || currency;
    if (priceTo && priceTo > priceFrom) {
      return `From ${symbol}${priceFrom.toLocaleString()} – ${symbol}${priceTo.toLocaleString()}`;
    }
    return `From ${symbol}${priceFrom.toLocaleString()}`;
  };

  const formatDuration = (duration?: string | null) => {
    if (!duration) return null;
    // If duration is already in range format (e.g., "3-4 hours"), return as-is
    if (duration.includes("-")) {
      return duration.replace("-", "–");
    }
    return duration;
  };

  return (
    <section>
      <SectionHeading sub="Tailored options for every event type">
        Booking Packages
      </SectionHeading>
      <div className="grid gap-4 sm:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={cn(
              "relative flex flex-col gap-0 overflow-hidden border-white/8 p-5",
              pkg.popular
                ? "to-h_blackLight/30 border-amber-500/30 bg-linear-to-b from-amber-500/10"
                : "bg-h_blackLight/30",
            )}
          >
            {pkg.popular && (
              <Badge className="absolute top-3 right-3 border-amber-500/25 bg-amber-500/15 text-[11px] text-amber-400">
                Most Popular
              </Badge>
            )}
            {pkg.icon && (
              <div className="bg-h_red/10 border-h_red/20 mb-3 flex size-10 items-center justify-center rounded-lg border">
                <pkg.icon className="text-h_red h-4 w-4" />
              </div>
            )}
            <p className="text-sm font-semibold text-white">{pkg.name}</p>
            <p className="text-h_red mt-1 text-lg font-bold">
              {formatPrice(pkg.priceFrom, pkg.currency, pkg.priceTo)}
            </p>
            {pkg.duration && (
              <p className="mb-3 text-xs text-gray-500">
                {formatDuration(pkg.duration)}
              </p>
            )}
            <ul className="flex flex-1 flex-col gap-1.5">
              {pkg.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-1.5 text-xs text-gray-400"
                >
                  <CircleCheck className="h-3 w-3 shrink-0 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              className="bg-h_red hover:bg-h_redDark mt-4 w-full font-semibold text-white"
              size="sm"
              onClick={() => openBookingModal?.(pkg.name, pkg.priceFrom)}
            >
              Enquire
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
