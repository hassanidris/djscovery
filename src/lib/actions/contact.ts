"use server";

import { z } from "zod";
import { headers } from "next/headers";
import prisma from "@/lib/client";
import { sendEmail } from "@/lib/email/sendEmail";
import {
  contactInternalEmailSubject,
  contactInternalEmailHtml,
  contactAutoReplySubject,
  contactAutoReplyHtml,
} from "@/lib/email/templates/contact";
import { CONTACT_CATEGORIES, type ContactFormState } from "./contact.constants";

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

async function isRateLimited(email: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const count = await prisma.contactSubmission.count({
    where: { email, createdAt: { gte: since } },
  });
  return count >= RATE_LIMIT_MAX;
}

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

  if (await isRateLimited(email)) {
    return {
      success: false,
      message:
        "Too many messages from this email — please wait an hour before trying again.",
    };
  }

  const headersList = await headers();
  const ipAddress =
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ??
    headersList.get("x-real-ip") ??
    "unknown";
  const userAgent = headersList.get("user-agent") ?? undefined;

  await prisma.contactSubmission.create({
    data: { name, email, category, message, ipAddress, userAgent },
  });

  const contactTo = process.env.RESEND_CONTACT_TO ?? "support@djcovery.com";

  await Promise.allSettled([
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

  return { success: true };
}
