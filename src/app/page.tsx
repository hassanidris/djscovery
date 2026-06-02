import { createClient } from "@/lib/supabase/server";
import Hero from "@/components/Hero";
import HomeDJsTabs from "@/components/home/HomeDJsTabs";
import type { DemoDJ } from "@/components/home/HomeDJsRow";
import HomeEventsSection from "@/components/home/HomeEventsSection";
import HomeFeaturedDJs from "@/components/home/HomeFeaturedDJs";
import HomeGenresSection from "@/components/home/HomeGenresSection";
import HomeOpenGigsSection from "@/components/home/HomeOpenGigsSection";
import HomeCommunityHighlights from "@/components/home/HomeCommunityHighlights";
import HomeCtaBanner from "@/components/home/HomeCtaBanner";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NEW_DJS: DemoDJ[] = [
  {
    id: 1,
    stageName: "DJ Nova",
    avatar: "/rated-1.webp",
    genres: ["House", "Techno"],
    city: "Stockholm",
    country: "Sweden",
    rating: 4.5,
    followers: 1240,
  },
  {
    id: 2,
    stageName: "Kayla Bass",
    avatar: "/rated-2.webp",
    genres: ["House", "R&B"],
    city: "London",
    country: "UK",
    rating: 4.3,
    followers: 890,
  },
  {
    id: 3,
    stageName: "DJ Vishnu",
    avatar: "/rated-3.webp",
    genres: ["Techno", "Drum & Bass"],
    city: "Bangalore",
    country: "India",
    rating: 4.6,
    followers: 2100,
  },
  {
    id: 4,
    stageName: "Sara Beats",
    avatar: "/rated-4.webp",
    genres: ["Deep House", "Trance"],
    city: "Paris",
    country: "France",
    rating: 4.4,
    followers: 760,
  },
  {
    id: 5,
    stageName: "Marcus Groove",
    avatar: "/rated-5.webp",
    genres: ["Hip-Hop", "R&B"],
    city: "New York",
    country: "USA",
    rating: 4.7,
    followers: 3400,
  },
  {
    id: 6,
    stageName: "Amara Pulse",
    avatar: "/rated-6.webp",
    genres: ["Afrobeats", "Amapiano"],
    city: "Lagos",
    country: "Nigeria",
    rating: 4.8,
    followers: 5200,
  },
  {
    id: 7,
    stageName: "DJ Storm",
    avatar: "/rated-7.webp",
    genres: ["Techno", "House"],
    city: "Tokyo",
    country: "Japan",
    rating: 4.5,
    followers: 1800,
  },
  {
    id: 8,
    stageName: "Elena Vibes",
    avatar: "/rated-8.webp",
    genres: ["Reggaeton", "House"],
    city: "Barcelona",
    country: "Spain",
    rating: 4.2,
    followers: 1100,
  },
];

const TRENDING_DJS: DemoDJ[] = [
  {
    id: 9,
    stageName: "Peggy Gou",
    avatar: "/rated-9.webp",
    genres: ["House", "Techno"],
    city: "Seoul",
    country: "S. Korea",
    rating: 4.9,
    followers: 87000,
  },
  {
    id: 10,
    stageName: "DJ Echo",
    avatar: "/rated-10.webp",
    genres: ["House", "Deep House"],
    city: "Stockholm",
    country: "Sweden",
    rating: 4.8,
    followers: 42000,
  },
  {
    id: 11,
    stageName: "NightOwl",
    avatar: "/rated-1.webp",
    genres: ["Techno", "Industrial"],
    city: "Berlin",
    country: "Germany",
    rating: 4.7,
    followers: 31000,
  },
  {
    id: 12,
    stageName: "DJ Soleil",
    avatar: "/rated-2.webp",
    genres: ["Afrobeats", "Amapiano"],
    city: "Dakar",
    country: "Senegal",
    rating: 4.7,
    followers: 28000,
  },
  {
    id: 13,
    stageName: "RHYTHMX",
    avatar: "/rated-3.webp",
    genres: ["House", "Techno"],
    city: "Miami",
    country: "USA",
    rating: 4.6,
    followers: 19000,
  },
  {
    id: 14,
    stageName: "Luna Beats",
    avatar: "/rated-4.webp",
    genres: ["Deep House", "Trance"],
    city: "Amsterdam",
    country: "Netherlands",
    rating: 4.6,
    followers: 15000,
  },
];

const Homepage = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col">
      {/* Video hero */}
      <Hero />

      {/* Featured DJs */}
      <HomeFeaturedDJs />

      {/* DJ rows with tabs */}
      <HomeDJsTabs newDJs={NEW_DJS} trendingDJs={TRENDING_DJS} />

      {/* Upcoming Events */}
      <HomeEventsSection />

      {/* Open Gigs */}
      <HomeOpenGigsSection />

      {/* Community Highlights */}
      <HomeCommunityHighlights />

      {/* CTA Banner */}
      <HomeCtaBanner />

      {/* Browse by Genre */}
      <HomeGenresSection />

      {/* CTA section */}
      <div className="flex flex-col items-center justify-center gap-8 py-16 px-4 border-t border-white/5">
        {user ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-300 text-sm">
              Signed in as <span className="text-h_cyan">{user.email}</span>
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                className="bg-h_cyan hover:bg-h_cyanDark text-black font-semibold h-auto py-3 px-6"
              >
                <Link href="/community">Community</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-h_cyan text-h_cyan hover:bg-h_cyan hover:text-black font-semibold h-auto py-3 px-6"
              >
                <Link href="/directory">Browse DJs</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-gray-400 text-lg">
              Join the world&apos;s first DJ community platform
            </p>
            <div className="flex gap-4">
              <Button
                asChild
                variant="outline"
                className="border-h_cyan text-h_cyan hover:bg-h_cyan hover:text-black font-semibold h-auto py-3 px-6"
              >
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button
                asChild
                className="bg-h_cyan hover:bg-h_cyanDark text-black font-semibold h-auto py-3 px-6"
              >
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
