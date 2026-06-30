"use server";

import { z } from "zod";
import { headers } from "next/headers";
import prisma from "@/lib/client";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  contactInternalEmailSubject,
  contactInternalEmailHtml,
  contactAutoReplySubject,
  contactAutoReplyHtml,
} from "@/lib/email/templates/contact";
import {
  CONTACT_CATEGORIES,
  CONTACT_CATEGORY_TO_ENUM,
  type ContactFormState,
} from "./contact.constants";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  category: z.enum(CONTACT_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    category: formData.get("category") as string,
    message: formData.get("message") as string,
    honeypot: (formData.get("honeypot") as string) ?? "",
  };

  const parsed = contactSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  const { name, email, category, message } = parsed.data;

  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  const userAgent = headersList.get("user-agent") ?? undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${email}))`;

    const count = await tx.contactSubmission.count({
      where: { email, createdAt: { gte: since } },
    });

    if (count >= RATE_LIMIT_MAX) {
      return { rateLimited: true as const };
    }

    await tx.contactSubmission.create({
      data: {
        name,
        email,
        category: CONTACT_CATEGORY_TO_ENUM[category],
        message,
        ipAddress,
        userAgent,
        userId: user?.id,
      },
    });

    return { rateLimited: false as const };
  });

  if (result.rateLimited) {
    return {
      success: false,
      message:
        "Too many messages from this email — please wait an hour before trying again.",
    };
  }

  const contactTo = process.env.RESEND_CONTACT_TO ?? "support@djcovery.com";

  const [internalResult, autoReplyResult] = await Promise.allSettled([
    sendEmail({
      to: contactTo,
      emailType: "CONTACT_FORM_INTERNAL",
      subject: contactInternalEmailSubject(category),
      html: contactInternalEmailHtml({ name, email, category, message }),
      replyTo: email,
    }),
    sendEmail({
      to: email,
      emailType: "CONTACT_FORM_AUTO_REPLY",
      subject: contactAutoReplySubject(),
      html: contactAutoReplyHtml({ name }),
      replyTo: contactTo,
    }),
  ]);

  if (
    internalResult.status !== "fulfilled" ||
    autoReplyResult.status !== "fulfilled"
  ) {
    console.error("[contact] Email delivery failure:", {
      internal: internalResult,
      autoReply: autoReplyResult,
    });
    return {
      success: false,
      message:
        "Your message was saved, but we couldn't send a confirmation email. We'll still get back to you.",
    };
  }

  return { success: true };
}
