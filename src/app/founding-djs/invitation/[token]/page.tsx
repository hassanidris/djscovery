import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  getValidFoundingInvitation,
  maskInvitationEmail,
} from "@/lib/founding/invitations";
import {
  acceptFoundingInvitationAction,
  signOutAndRetryFoundingInvitation,
} from "@/lib/actions/founding-invitations";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Founding DJ Invitation | DJcovery",
  robots: { index: false, follow: false, noarchive: true },
};

const ERROR_MESSAGES: Record<string, string> = {
  email_mismatch:
    "This invitation belongs to a different email address. Sign out and retry with the invited email address.",
  already_linked:
    "This application is already connected to another account. Contact support if you believe this is an error.",
  invalid_invitation:
    "This invitation is invalid, expired, or has already been used. Contact support if you need a new invitation.",
  rate_limited:
    "Too many attempts to open this invitation. Please try again later.",
};

export default async function FoundingInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown";
  const limit = await rateLimit(`founding-invitation:${ip}`, 10, 60 * 60);
  if (!limit.success) {
    return <InvitationMessage error={ERROR_MESSAGES.rate_limited} />;
  }

  const invitation = await getValidFoundingInvitation(token);
  if (!invitation?.email || !invitation.foundingApplication) {
    return (
      <InvitationMessage error={ERROR_MESSAGES.invalid_invitation} helpLink />
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const emailMatches =
    Boolean(user?.email) &&
    user!.email!.trim().toLowerCase() === invitation.email.trim().toLowerCase();
  const visibleError = query.error ? ERROR_MESSAGES[query.error] : undefined;
  const displayName =
    invitation.foundingApplication.stageName ||
    invitation.foundingApplication.name;

  return (
    <main className="from-h_charcoal min-h-[60vh] bg-linear-to-b to-black px-4 py-12">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-h_redLight text-xs font-semibold tracking-[0.18em] uppercase">
          Founding DJ invitation
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          You&apos;re invited, {displayName}
        </h1>
        <p className="mt-4 text-gray-300">
          Your application has been approved. Accept this invitation to create
          your DJ profile and continue onboarding.
        </p>
        <p className="mt-3 text-sm text-gray-400">
          Invitation sent to {maskInvitationEmail(invitation.email)} · expires{" "}
          {invitation.expiresAt.toLocaleDateString("en-US", {
            dateStyle: "long",
            timeZone: "UTC",
          })}
        </p>

        {visibleError && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"
          >
            {visibleError}
          </p>
        )}

        {user ? (
          emailMatches ? (
            <form action={acceptFoundingInvitationAction} className="mt-7">
              <input type="hidden" name="token" value={token} />
              <button
                type="submit"
                className="bg-h_red hover:bg-h_redDark rounded-lg px-7 py-3 font-semibold text-white transition-colors"
              >
                Accept invitation and continue
              </button>
            </form>
          ) : (
            <div className="mt-7 space-y-4">
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                You are signed in as {user.email}. This invitation can only be
                accepted by {maskInvitationEmail(invitation.email)}.
              </p>
              <form action={signOutAndRetryFoundingInvitation}>
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="rounded-lg border border-white/20 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/5"
                >
                  Sign out and retry with invited email
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href={`/sign-up?role=dj&invitationToken=${encodeURIComponent(token)}`}
              className="bg-h_red hover:bg-h_redDark rounded-lg px-6 py-3 font-semibold text-white transition-colors"
            >
              Create account
            </Link>
            <Link
              href={`/sign-in?invitationToken=${encodeURIComponent(token)}`}
              className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/5"
            >
              Sign in
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500">
          Use the same email address that received this invitation. The link can
          only be used once.
        </p>
      </div>
    </main>
  );
}

function InvitationMessage({
  error,
  helpLink = false,
}: {
  error: string;
  helpLink?: boolean;
}) {
  return (
    <main className="from-h_charcoal flex min-h-[60vh] items-center justify-center bg-linear-to-b to-black px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          Invitation unavailable
        </h1>
        <p role="alert" className="mt-4 text-gray-300">
          {error}
        </p>
        {helpLink && (
          <a
            href="mailto:support@djcovery.com"
            className="text-h_redLight mt-6 inline-block underline"
          >
            Contact support
          </a>
        )}
      </div>
    </main>
  );
}
