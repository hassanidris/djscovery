import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarCheck2, Mail, Rocket } from "lucide-react";

type BookCTAVariant = "free" | "premium";
type BookCTALayout = "mobile" | "desktop";

type Props = {
  stageName: string;
  bookingHref: string;
  variant?: BookCTAVariant;
  layout?: BookCTALayout;
  responseRate?: number;
  bookingSuccessRate?: number;
};

export function BookCTA({
  stageName,
  bookingHref,
  variant = "free",
  layout = "mobile",
  responseRate = 0,
  bookingSuccessRate = 0,
}: Props) {
  const isPremium = variant === "premium";
  const isDesktop = layout === "desktop";

  return (
    <div
      className={cn(isDesktop && "hidden lg:block", !isDesktop && "lg:hidden")}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden p-5",
          isPremium
            ? "to-h_blackLight/30 border-amber-500/25 bg-linear-to-b from-amber-500/8"
            : "from-h_red/10 border-h_red/20 bg-linear-to-b to-transparent",
        )}
      >
        {isPremium && (
          <div className="mb-1 flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold tracking-wider text-amber-400 uppercase">
              Priority Booking
            </span>
          </div>
        )}

        <h3 className="mb-1 text-sm font-semibold text-white">
          Book {stageName}
        </h3>

        {isPremium && (
          <div className="mb-4 flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">
              Responding within 2 hours
            </span>
          </div>
        )}

        {!isPremium && (
          <p className="mb-4 text-xs text-gray-400">
            For clubs, festivals, events &amp; more
          </p>
        )}

        <Button
          className="bg-h_red hover:bg-h_redDark mb-2 w-full font-semibold text-white"
          asChild
        >
          <a href={bookingHref}>
            <CalendarCheck2 className="mr-1.5 h-3.5 w-3.5" />
            Book / Hire DJ
          </a>
        </Button>
        <Button
          variant="outline"
          className="w-full border-white/15 text-gray-300 hover:bg-white/5"
          asChild
        >
          <a href={bookingHref}>
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Send Inquiry
          </a>
        </Button>

        {isPremium && isDesktop && (
          <div className="mt-3 flex justify-between border-t border-white/5 pt-3">
            <div className="text-center">
              <p className="text-sm font-bold text-white">{responseRate}%</p>
              <p className="text-[11px] text-gray-500">Response Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">
                {bookingSuccessRate}%
              </p>
              <p className="text-[11px] text-gray-500">Booking Rate</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white">&lt;2h</p>
              <p className="text-[11px] text-gray-500">Reply Time</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
