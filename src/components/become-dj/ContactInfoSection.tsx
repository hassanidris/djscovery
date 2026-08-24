"use client";

import { UseFormRegister } from "react-hook-form";
import type { CreateDjProfileInput } from "@/lib/validations/dj-profile";
import { inputCls, labelCls, sectionCls, sectionTitleCls } from "./constants";

export function ContactInfoSection({
  register,
  errors,
}: {
  register: UseFormRegister<CreateDjProfileInput>;
  errors: {
    bookingEmail?: { message?: string };
    bookingPhone?: { message?: string };
  };
}) {
  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>
        Contact Information{" "}
        <span className="text-sm font-normal text-gray-400">(optional)</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        How organizers can reach you for bookings.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Booking Email</label>
          <input
            {...register("bookingEmail", {
              setValueAs: (v) => (v?.trim() ? v.trim() : undefined),
            })}
            type="email"
            placeholder="bookings@yourname.com"
            className={inputCls}
          />
          {errors.bookingEmail && (
            <p className="text-xs text-red-400">
              {errors.bookingEmail.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Booking Phone</label>
          <input
            {...register("bookingPhone")}
            type="tel"
            placeholder="+44 7700 900123"
            className={inputCls}
          />
          {errors.bookingPhone && (
            <p className="text-xs text-red-400">
              {errors.bookingPhone.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
