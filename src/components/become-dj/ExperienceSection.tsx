"use client";

import { UseFormRegister } from "react-hook-form";
import type { CreateDjProfileInput } from "@/lib/validations/dj-profile";
import { inputCls, labelCls, sectionCls, sectionTitleCls } from "./constants";

export function ExperienceSection({
  register,
  errors,
}: {
  register: UseFormRegister<CreateDjProfileInput>;
  errors: {
    experienceYears?: { message?: string };
  };
}) {
  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>
        Experience{" "}
        <span className="text-sm font-normal text-gray-400">(optional)</span>
      </h2>
      <p className="-mt-2 text-xs text-gray-400">
        Help organizers understand your background and skill level.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>Years of Experience</label>
          <input
            {...register("experienceYears", {
              setValueAs: (v) =>
                v === "" || isNaN(Number(v)) ? undefined : Number(v),
            })}
            type="number"
            min="0"
            max="50"
            placeholder="e.g. 5"
            className={inputCls}
          />
          {errors.experienceYears && (
            <p className="text-xs text-red-400">
              {errors.experienceYears.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
