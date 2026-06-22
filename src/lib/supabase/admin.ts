import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Generates a one-time magic-link for the welcome email CTA.
 * Falls back to baseUrl if the service-role key is not configured.
 */
export async function generateWelcomeCta(email: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://djcovery.com";
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return baseUrl;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${baseUrl}/auth/callback` },
    });
    if (error || !data?.properties?.action_link) return baseUrl;
    return data.properties.action_link;
  } catch {
    return baseUrl;
  }
}
