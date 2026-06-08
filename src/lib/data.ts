import { ALL_DEMO_DJS } from "@/data/djs";

const _BASE = new Date("2026-06-01T12:00:00Z").getTime();
const _DAY = 86_400_000;
const _HR = 3_600_000;

const _FANS = ALL_DEMO_DJS.slice(6, 11).map((dj, i) => ({
  id: `demo-dj-${6 + i}`,
  username: dj.slug,
  image: dj.avatar.url,
}));

const _BASE_USER = {
  email: "",
  name: null,
  status: "ACTIVE" as const,
  createdAt: new Date(_BASE),
  updatedAt: new Date(_BASE),
  deletedAt: null,
  countryId: null,
  cityId: null,
};

function _c(
  id: number,
  postId: number,
  fan: (typeof _FANS)[0],
  content: string,
  replies?: {
    id: number;
    content: string;
    user: { username: string; image: string | null };
  }[],
) {
  return {
    id,
    content,
    createdAt: new Date(_BASE - Math.abs(postId) * _HR),
    updatedAt: new Date(_BASE),
    deletedAt: null,
    userId: fan.id,
    postId,
    parentId: null,
    user: { ..._BASE_USER, ...fan },
    replies: replies ?? [],
  };
}

export function demoPosts() {
  const djs = ALL_DEMO_DJS;
  const u = (i: number) => ({
    id: `demo-dj-${i}`,
    username: djs[i].slug,
    name: djs[i].stageName,
    image: djs[i].avatar.url,
  });
  const likes = (n: number) =>
    Array.from({ length: n }, (_, i) => ({ userId: `fan-${i}` }));

  return [
    {
      id: -1,
      type: "TEXT",
      content:
        "Just dropped my latest Afro-House set 🎧 The crowd at Berghain last night was absolutely electric — thank you Berlin! More shows coming very soon.",
      media: [],
      likes: likes(23),
      _count: { comments: 2 },
      createdAt: new Date(_BASE),
      user: u(0),
      demoComments: [
        _c(
          -101,
          -1,
          _FANS[0],
          "This set was insane! 🔥 Been listening on repeat all morning.",
        ),
        _c(
          -102,
          -1,
          _FANS[1],
          "When are you coming to Stockholm? We need you here badly! 🙏",
          [
            {
              id: -201,
              content:
                "Seconded!! Stockholm crowd would absolutely go crazy for this 🎶",
              user: _FANS[2],
            },
          ],
        ),
      ],
    },
    {
      id: -2,
      type: "IMAGE",
      content:
        "New press shots from the Ibiza closing party 📸 What a summer it's been. Grateful for every single moment. See you all next season ❤️",
      media: [{ id: -10, type: "IMAGE", url: "/gallery-1.png" }],
      likes: likes(41),
      _count: { comments: 2 },
      createdAt: new Date(_BASE - _DAY),
      user: u(1),
      demoComments: [
        _c(
          -103,
          -2,
          _FANS[2],
          "Iconic as always 🌊 The photos are absolutely stunning!",
        ),
        _c(
          -104,
          -2,
          _FANS[3],
          "Closing season was way too short. Roll on summer 2027! ☀️",
        ),
      ],
    },
    {
      id: -3,
      type: "VIDEO",
      content:
        "Behind the scenes footage from last night's set at Fabric 🎬 The energy in that room was something I'll never forget. Full set up on SoundCloud now.",
      media: [{ id: -11, type: "VIDEO", url: "/bnr.mp4" }],
      likes: likes(18),
      _count: { comments: 2 },
      createdAt: new Date(_BASE - 2 * _DAY),
      user: u(2),
      demoComments: [
        _c(
          -105,
          -3,
          _FANS[4],
          "That drop at 02:34 🤯 The crowd completely lost it — absolute madness.",
          [
            {
              id: -202,
              content:
                "I was there!! Honestly one of the best moments I've witnessed live 🔥",
              user: _FANS[0],
            },
          ],
        ),
        _c(
          -106,
          -3,
          _FANS[1],
          "A Fabric residency needs to happen. Please make it happen! 🙌",
        ),
      ],
    },
    {
      id: -4,
      type: "TEXT",
      content:
        "Studio mode fully activated 🎶 Been heads-down for 3 months building something really special. Can't say too much yet — but it involves a few artists you might know � Stay tuned.",
      media: [],
      likes: likes(67),
      _count: { comments: 3 },
      createdAt: new Date(_BASE - 3 * _DAY),
      user: u(3),
      demoComments: [
        _c(
          -107,
          -4,
          _FANS[3],
          "The suspense is literally KILLING me 😭 Drop the collab already!!",
        ),
        _c(
          -108,
          -4,
          _FANS[0],
          "Whatever you're cooking in that studio, we already know it's going to be 🔥",
        ),
        _c(
          -109,
          -4,
          _FANS[2],
          "Take all the time you need and give us pure perfection 🙏",
          [
            {
              id: -203,
              content: "Agreed. We will wait as long as it takes 💯",
              user: _FANS[1],
            },
          ],
        ),
      ],
    },
    {
      id: -5,
      type: "IMAGE",
      content:
        "Cape Town to Amsterdam 🇿🇦→🇳🇱 Grateful for every show, every crowd, every single moment on this journey. See you all at ADE this October 🖤",
      media: [{ id: -12, type: "IMAGE", url: "/gallery-2.png" }],
      likes: likes(89),
      _count: { comments: 3 },
      createdAt: new Date(_BASE - 4 * _DAY),
      user: u(4),
      demoComments: [
        _c(
          -110,
          -5,
          _FANS[4],
          "ADE is going to be absolutely legendary with you on the lineup 🙌",
        ),
        _c(
          -111,
          -5,
          _FANS[2],
          "Cape Town crowd will miss you! Come back soon 🌍",
          [
            {
              id: -204,
              content: "The return show is going to be absolutely insane 🔥",
              user: _FANS[3],
            },
          ],
        ),
        _c(
          -112,
          -5,
          _FANS[1],
          "Bought my ADE ticket the second I saw your name on the lineup 🎫",
        ),
      ],
    },
    {
      id: -6,
      type: "AUDIO",
      content:
        "New 2-hour Progressive House mix just uploaded 🎵 This one took 3 weeks to put together — every single track chosen with real intention. Drop a 🎧 below if you're listening right now!",
      media: [
        {
          id: -13,
          type: "AUDIO",
          url: "",
          title: "Progressive House Mix Vol. 12",
          duration: "2:04:37",
        },
      ],
      likes: likes(34),
      _count: { comments: 2 },
      createdAt: new Date(_BASE - 5 * _DAY),
      user: u(5),
      demoComments: [
        _c(
          -113,
          -6,
          _FANS[0],
          "🎧🎧🎧 Already on my third listen. The track selection is absolutely perfect.",
        ),
        _c(
          -114,
          -6,
          _FANS[4],
          "3 hours felt like 30 minutes — that's how you know it's a great mix 💯",
        ),
      ],
    },
  ];
}

export type DjUser = {
  id: string;
  username: string;
  stageName: string | null;
  avatar: string | null;
  genres: string | null;
  country: string | null;
  city: string | null;
  slug?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
  verified?: boolean;
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
    isPremium: dj.plan === "premium",
    isFeatured: dj.featured,
    verified: dj.verified,
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
