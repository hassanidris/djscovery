export interface PackageTemplate {
  name: string;
  priceFrom: number;
  priceTo?: number;
  currency: string;
  durationMin: number;
  durationMax: number;
  features: string[];
  popular?: boolean;
}

export const PACKAGE_TEMPLATES: Record<string, PackageTemplate> = {
  club_night: {
    name: "Club Night",
    priceFrom: 2500,
    priceTo: 4000,
    currency: "GBP",
    durationMin: 3,
    durationMax: 4,
    features: [
      "Pre-event consultation",
      "Custom setlist",
      "Social media promotion",
      "Press kit",
    ],
  },
  festival: {
    name: "Festival Set",
    priceFrom: 6000,
    priceTo: 10000,
    currency: "GBP",
    durationMin: 1,
    durationMax: 1.5,
    features: [
      "Full production rider",
      "Stage management",
      "Exclusive promotion",
      "Post-show content",
    ],
    popular: true,
  },
  wedding: {
    name: "Wedding Reception",
    priceFrom: 3500,
    priceTo: 5000,
    currency: "GBP",
    durationMin: 4,
    durationMax: 5,
    features: [
      "Personalized playlist",
      "Song requests welcome",
      "MC services included",
      "Professional PA system",
      "Lighting package included",
      "Wedding meeting consultation",
      "Backup equipment on-site",
    ],
  },
  corporate: {
    name: "Corporate Event",
    priceFrom: 4000,
    priceTo: 7000,
    currency: "GBP",
    durationMin: 3,
    durationMax: 4,
    features: [
      "Brand-aligned music curation",
      "Professional attire",
      "Setup 2 hours before event",
      "Sound system provided",
      "Microphone for announcements",
      "Volume control for networking",
      "Insurance documentation provided",
    ],
  },
  private_party: {
    name: "Private Party",
    priceFrom: 2000,
    priceTo: 3500,
    currency: "GBP",
    durationMin: 3,
    durationMax: 4,
    features: [
      "Flexible music selection",
      "Song requests encouraged",
      "Compact sound system provided",
      "Quick setup (1 hour)",
      "Playlist customization call",
      "Travel within 30km included",
    ],
  },
  lounge: {
    name: "Lounge/Bar Residency",
    priceFrom: 1500,
    priceTo: 2500,
    currency: "GBP",
    durationMin: 2,
    durationMax: 3,
    features: [
      "Background music curation",
      "Volume-appropriate mixing",
      "Regular weekly/monthly option",
      "Social media cross-promotion",
      "Quick setup & breakdown",
    ],
  },
  birthday: {
    name: "Birthday Celebration",
    priceFrom: 1800,
    priceTo: 3000,
    currency: "GBP",
    durationMin: 3,
    durationMax: 4,
    features: [
      "Birthday song coordination",
      "Age-appropriate music",
      "Special requests honored",
      "Sound system provided",
      "Party lighting included",
      "Flexible playlist",
    ],
  },
  hotel: {
    name: "Hotel/Restaurant Regular",
    priceFrom: 1200,
    priceTo: 2000,
    currency: "GBP",
    durationMin: 2,
    durationMax: 3,
    features: [
      "Ambient music curation",
      "Dinner-appropriate volume",
      "Monthly/weekly residency options",
      "Brand-aligned playlists",
      "Professional presentation",
    ],
  },
};

export const TEMPLATE_LIST = Object.entries(PACKAGE_TEMPLATES).map(
  ([key, template]) => ({
    key,
    ...template,
  }),
);
