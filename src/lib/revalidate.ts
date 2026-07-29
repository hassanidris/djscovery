/**
 * Helper function to trigger on-demand revalidation of cached pages
 * This calls the internal revalidation API to invalidate cache when data changes
 */

export async function revalidatePath(path: string) {
  const secret = process.env.REVALIDATE_SECRET_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!secret || !siteUrl) {
    console.warn("[Revalidation] Missing REVALIDATE_SECRET_KEY or NEXT_PUBLIC_SITE_URL");
    return;
  }

  try {
    await fetch(`${siteUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    });
    console.log(`[Revalidation] Triggered revalidation for: ${path}`);
  } catch (error) {
    console.error(`[Revalidation] Failed to revalidate ${path}:`, error);
  }
}

/**
 * Revalidate multiple paths at once
 */
export async function revalidatePaths(paths: string[]) {
  await Promise.all(paths.map((path) => revalidatePath(path)));
}
