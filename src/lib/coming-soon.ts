import { headers } from "next/headers";

/**
 * Returns true when the request is for the /coming-soon placeholder page.
 * The middleware sets the x-is-coming-soon header for this route so the root
 * layout can render a clean page without the public navbar/footer shell.
 */
export async function isComingSoonRoute(): Promise<boolean> {
  const headersList = await headers();
  return (
    headersList.get("x-is-coming-soon") === "true" ||
    headersList.get("x-invoke-path") === "/coming-soon" ||
    headersList.get("x-pathname") === "/coming-soon"
  );
}
