export function getDjProfileCompleteness(profile: {
  stageName: string;
  avatar: string | null;
  coverImage: string | null;
  bio: string | null;
  genres: unknown[];
  socialLinks: unknown[];
  media: unknown[];
  feeMin: number | null;
  feeMax: number | null;
  countryId: number;
  cityId: number;
}): { score: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!profile.stageName?.trim(), "Add stage name"],
    [!!profile.avatar, "Upload profile photo"],
    [!!profile.coverImage, "Upload cover image"],
    [!!profile.bio?.trim(), "Add bio"],
    [profile.genres.length > 0, "Add at least one genre"],
    [profile.socialLinks.length > 0, "Add at least one social link"],
    [profile.media.length > 0, "Add at least one mix or video"],
    [profile.feeMin !== null && profile.feeMax !== null, "Set pricing/rates"],
    [!!profile.countryId, "Set country"],
    [!!profile.cityId, "Set city"],
  ];

  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  const score = Math.round(
    ((checks.length - missing.length) / checks.length) * 100,
  );

  return { score, missing };
}
