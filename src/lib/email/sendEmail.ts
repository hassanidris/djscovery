import { EmailType } from "@prisma/client";
import resend from "./client";
import prisma from "@/lib/client";

interface SendEmailParams {
  to: string;
  userId?: string;
  emailType: EmailType;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  userId,
  emailType,
  subject,
  html,
}: SendEmailParams): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[sendEmail] RESEND_API_KEY not set — skipping: ${emailType} → ${to}`);
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "noreply@djcovery.com";
  let status: "SENT" | "FAILED" = "FAILED";
  let providerMessageId: string | undefined;
  let errorMessage: string | undefined;

  try {
    const { data, error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      errorMessage = error.message;
    } else {
      status = "SENT";
      providerMessageId = data?.id ?? undefined;
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown error";
  }

  try {
    await prisma.emailLog.create({
      data: {
        userId: userId ?? null,
        recipientEmail: to,
        emailType,
        status,
        providerMessageId,
        errorMessage,
        lastAttemptAt: new Date(),
      },
    });
  } catch {
    console.error("[sendEmail] Failed to write EmailLog:", { to, emailType, status });
  }
}
