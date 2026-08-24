"use client";

import { UseFormRegister } from "react-hook-form";
import type { CreateDjProfileInput } from "@/lib/validations/dj-profile";
import { inputCls, labelCls, sectionCls, sectionTitleCls } from "./constants";

export function BasicInfoSection({
  register,
  errors,
  stageName,
  bio,
  slugPreview,
}: {
  register: UseFormRegister<CreateDjProfileInput>;
  errors: {
    stageName?: { message?: string };
  };
  stageName: string;
  bio: string;
  slugPreview: string;
}) {
  return (
    <div className={sectionCls}>
      <h2 className={sectionTitleCls}>Basic Info</h2>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          DJ Stage Name <span className="text-h_redLight">*</span>
        </label>
        <input
          {...register("stageName")}
          type="text"
          placeholder="e.g. DJ Echo"
          className={inputCls}
        />
        {errors.stageName && (
          <p className="text-xs text-red-400">{errors.stageName.message}</p>
        )}
        {slugPreview && (
          <p className="mt-0.5 text-xs text-gray-400">
            Profile URL:{" "}
            <span className="text-gray-400">
              DJcovery.com/djs/{slugPreview}
            </span>
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>Bio</label>
        <textarea
          {...register("bio")}
          placeholder="Tell fans about yourself, your style, your influences..."
          rows={4}
          className={`${inputCls} resize-none`}
        />
        <p className="text-right text-xs text-gray-400">
          {bio?.length || 0}/500
        </p>
      </div>
    </div>
  );
}
