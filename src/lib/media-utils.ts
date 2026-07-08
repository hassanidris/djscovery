// Pure utility functions for media provider detection and thumbnail extraction
// These can be used in both server and client code

type MediaProvider =
  | "youtube"
  | "vimeo"
  | "soundcloud"
  | "instagram"
  | "unknown";

function isHostOrSubdomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

export function getMediaProvider(url: string): MediaProvider {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be" || isHostOrSubdomain(host, "youtube.com"))
      return "youtube";
    if (isHostOrSubdomain(host, "vimeo.com")) return "vimeo";
    if (isHostOrSubdomain(host, "soundcloud.com")) return "soundcloud";
    if (isHostOrSubdomain(host, "instagram.com") || host === "instagr.am")
      return "instagram";
  } catch {
    return "unknown";
  }
  return "unknown";
}

export function getYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (host === "youtu.be") return segments[0] ?? null;
    if (isHostOrSubdomain(host, "youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (
        parsed.pathname.startsWith("/embed/") ||
        parsed.pathname.startsWith("/shorts/")
      ) {
        return segments[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function getVideoThumbnailUrl(url: string): string | null {
  const provider = getMediaProvider(url);
  if (provider === "youtube") {
    const videoId = getYouTubeVideoId(url);
    if (videoId)
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  if (provider === "vimeo") {
    // Vimeo doesn't provide a simple thumbnail URL without API
    // This would require Vimeo API, so return null
    return null;
  }
  if (provider === "instagram") {
    // Instagram doesn't provide a public thumbnail API
    // oEmbed is the only way, but it's now restricted
    return null;
  }
  return null;
}
