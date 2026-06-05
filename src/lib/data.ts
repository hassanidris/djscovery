import { ALL_DEMO_DJS } from "@/data/djs";

export type DjUser = {
  id: string;
  username: string;
  stageName: string | null;
  avatar: string | null;
  genres: string | null;
  country: string | null;
  city: string | null;
  slug?: string;
  _count?: { followers: number };
};

export function demoDJsAsDjUsers(): DjUser[] {
  return ALL_DEMO_DJS.map((dj) => ({
    id: dj.id,
    username: dj.slug,
    stageName: dj.stageName,
    avatar: dj.avatar.url,
    genres: dj.genres.join(", "),
    country: dj.location.country,
    city: dj.location.city,
    slug: dj.slug,
    _count: { followers: dj.stats.followers },
  }));
}

export const mockDJs: DjUser[] = [
  {
    id: "mock-1",
    username: "dj_dimitri_vegas",
    stageName: "Dj. Dimitri Vegas & Like Mike",
    avatar: "/rated-2.webp",
    genres: "EDM, House",
    country: "Belgium",
    city: "Brussels",
    _count: { followers: 12430 },
  },
  {
    id: "mock-2",
    username: "dj_martin_garrix",
    stageName: "Dj. Martin Garrix",
    avatar: "/rated-3.webp",
    genres: "EDM, Progressive House",
    country: "Netherlands",
    city: "Amsterdam",
    _count: { followers: 9870 },
  },
  {
    id: "mock-3",
    username: "dj_alok",
    stageName: "Dj. Alok",
    avatar: "/rated-4.webp",
    genres: "House, Afrobeats",
    country: "Brazil",
    city: "Rio de Janeiro",
    _count: { followers: 7210 },
  },
  {
    id: "mock-4",
    username: "dj_timmy_trumpet",
    stageName: "Dj. Timmy Trumpet",
    avatar: "/rated-5.webp",
    genres: "Trance, EDM",
    country: "Australia",
    city: "Sydney",
    _count: { followers: 5540 },
  },
  {
    id: "mock-5",
    username: "dj_armin_van_buuren",
    stageName: "Dj. Armin Van Buuren",
    avatar: "/rated-6.webp",
    genres: "Trance, Progressive",
    country: "Netherlands",
    city: "Amsterdam",
    _count: { followers: 18920 },
  },
  {
    id: "mock-6",
    username: "dj_echo",
    stageName: "Dj. Echo",
    avatar: "/rated-1.webp",
    genres: "Techno, House",
    country: "Sweden",
    city: "Eskilstuna",
    _count: { followers: 3120 },
  },
];

export const directoryEvents = [
  {
    id: 1,
    djName: "Dj. Echo",
    venue: "Restaurang Grappa Matsal & Bar",
    location: "Eskilstuna, Sweden",
    date: "2026-05-29",
    dressCode: "Dress to impress",
    entryFee: "Free",
  },
  {
    id: 2,
    djName: "Dj. Peggy Gou",
    venue: "Lit Lounge Itaewon",
    location: "Seoul, South Korea",
    date: "2026-05-31",
    dressCode: "Smart casual",
    entryFee: "₩20,000",
  },
  {
    id: 3,
    djName: "Dj. Vishnu",
    venue: "Nolimmits Lounge & Club",
    location: "Bangalore, India",
    date: "2026-06-03",
    dressCode: "No Dress Code",
    entryFee: "₹1500",
  },
  {
    id: 4,
    djName: "Dj. Martin Garrix",
    venue: "Paradiso",
    location: "Amsterdam, Netherlands",
    date: "2026-06-07",
    dressCode: "Casual",
    entryFee: "€25",
  },
  {
    id: 5,
    djName: "Dj. Armin Van Buuren",
    venue: "Ziggo Dome",
    location: "Amsterdam, Netherlands",
    date: "2026-06-14",
    dressCode: "No restriction",
    entryFee: "€45",
  },
  {
    id: 6,
    djName: "Dj. Dimitri Vegas",
    venue: "Tomorrowland Main Stage",
    location: "Boom, Belgium",
    date: "2026-06-21",
    dressCode: "Festival attire",
    entryFee: "€120",
  },
  {
    id: 7,
    djName: "Dj. Alok",
    venue: "Green Valley",
    location: "Camboriú, Brazil",
    date: "2026-06-28",
    dressCode: "Casual",
    entryFee: "R$80",
  },
];

export const events = [
  {
    id: 1,
    clubName: "Event 1",
    eventName: "This is event 1",
    date: "2024-03-01",
    location: "Location 1",
    dressCode: "No",
    entryFees: "Kr 100",
    eventUrl: "",
  },
  {
    id: 2,
    clubName: "Event 1",
    eventName: "This is event 1",
    date: "2024-03-01",
    location: "Location 1",
    dressCode: "No",
    entryFees: "Kr 100",
    eventUrl: "",
  },
  {
    id: 3,
    clubName: "Event 1",
    eventName: "This is event 1",
    date: "2024-03-01",
    location: "Location 1",
    dressCode: "No",
    entryFees: "Kr 100",
    eventUrl: "",
  },
];

export const socialPlatforms = [
  {
    id: 1,
    platformName: "Facebook",
    icon: "faFacebook",
    url: "",
  },
  {
    id: 2,
    platformName: "Instagram",
    icon: "faInstagram",
    url: "",
  },
  {
    id: 3,
    platformName: "Twitter",
    icon: "faTwitter",
    url: "",
  },
  {
    id: 4,
    platformName: "LinkedIn",
    icon: "faLinkedIn",
    url: "",
  },
  {
    id: 5,
    platformName: "YouTube",
    icon: "faYouTube",
    url: "",
  },
];
