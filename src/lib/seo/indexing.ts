type SiteMode = "PRE_LAUNCH" | "BETA" | "LIVE";

const SITE_MODE = (process.env.SITE_MODE || "PRE_LAUNCH") as SiteMode;

export const indexingEnabled = SITE_MODE === "LIVE";
