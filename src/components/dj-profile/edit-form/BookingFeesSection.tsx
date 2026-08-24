"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES } from "@/config/currencies";
import { SectionCard } from "@/components/forms/SectionCard";

export function BookingFeesSection({
  bookingEmail,
  setBookingEmail,
  bookingPhone,
  setBookingPhone,
  feeMin,
  setFeeMin,
  feeMax,
  setFeeMax,
  feeCurrency,
  setFeeCurrency,
  currencyAutoSet,
  setCurrencyAutoSet,
}: {
  bookingEmail: string;
  setBookingEmail: (v: string) => void;
  bookingPhone: string;
  setBookingPhone: (v: string) => void;
  feeMin: string;
  setFeeMin: (v: string) => void;
  feeMax: string;
  setFeeMax: (v: string) => void;
  feeCurrency: string;
  setFeeCurrency: (v: string) => void;
  currencyAutoSet: boolean;
  setCurrencyAutoSet: (v: boolean) => void;
}) {
  return (
    <SectionCard
      title="Booking Contact & Fees"
      subtitle="How bookers can reach you and your rate range"
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Booking Email
            </Label>
            <Input
              type="email"
              value={bookingEmail}
              onChange={(e) => setBookingEmail(e.target.value)}
              placeholder="bookings@yourname.com"
              className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Booking Phone
            </Label>
            <Input
              type="tel"
              value={bookingPhone}
              onChange={(e) => setBookingPhone(e.target.value)}
              placeholder="+44 7700 900123"
              className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Min Fee
            </Label>
            <Input
              type="number"
              value={feeMin}
              onChange={(e) => setFeeMin(e.target.value)}
              placeholder="500"
              min={0}
              className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-gray-300">
              Max Fee
            </Label>
            <Input
              type="number"
              value={feeMax}
              onChange={(e) => setFeeMax(e.target.value)}
              placeholder="5000"
              min={0}
              className="focus:border-h_red/50 border-white/10 bg-white/5 text-white placeholder:text-gray-400"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label className="text-xs text-gray-300">Currency</Label>
              {currencyAutoSet && (
                <span className="text-[11px] text-gray-400">auto</span>
              )}
            </div>
            <Select
              value={feeCurrency}
              onValueChange={(value) => {
                setFeeCurrency(value);
                setCurrencyAutoSet(false);
              }}
            >
              <SelectTrigger className="focus:border-h_red/50 border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-black text-white">
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
