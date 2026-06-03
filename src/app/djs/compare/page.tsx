import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle, faXmark, faCrown, faArrowRight,
  faLock, faChartLine, faBolt, faCalendarCheck,
  faShield, faRocket, faFireFlameCurved,
} from "@fortawesome/free-solid-svg-icons";

type Row = {
  feature: string;
  category: string;
  free: boolean | string;
  premium: boolean | string;
  upgradeHook?: string;
};

const ROWS: Row[] = [
  // Hero
  { category: "Profile", feature: "DJ Name, Avatar & Cover Image", free: true, premium: true },
  { category: "Profile", feature: "Location & Genres", free: true, premium: true },
  { category: "Profile", feature: "Social Links", free: true, premium: true },
  { category: "Profile", feature: "Follower Count & Rating Display", free: true, premium: true },
  { category: "Profile", feature: "Verified DJ Badge", free: false, premium: true, upgradeHook: "Build instant trust with a blue checkmark" },
  { category: "Profile", feature: "Premium Badge", free: false, premium: true, upgradeHook: "Signal professionalism to every visitor" },
  { category: "Profile", feature: "Response Rate & Booking Rate Stats", free: false, premium: true, upgradeHook: "Organizers want to see reliability metrics" },
  { category: "Profile", feature: "Monthly Profile Views Counter", free: false, premium: true, upgradeHook: "Social proof that builds credibility" },
  // Content
  { category: "Content", feature: "Bio / About Me", free: true, premium: true },
  { category: "Content", feature: "Spotlight Section (1 Mix + 1 Video)", free: true, premium: true },
  { category: "Content", feature: "Where I've Played", free: true, premium: true },
  { category: "Content", feature: "Featured Releases", free: false, premium: true, upgradeHook: "Showcase your latest EP or single at the top" },
  { category: "Content", feature: "Career Highlights Timeline", free: false, premium: true, upgradeHook: "Tell your story — awards, festivals, milestones" },
  { category: "Content", feature: "Press & Media Coverage", free: false, premium: true, upgradeHook: "Mixmag? RA? Show it off" },
  { category: "Content", feature: "Industry Endorsements", free: false, premium: true, upgradeHook: "Testimonials from bookers = more bookings" },
  // Media
  { category: "Media", feature: "Photo Gallery (Unlimited)", free: true, premium: true },
  { category: "Media", feature: "Audio Mixes", free: "1 mix", premium: "Unlimited", upgradeHook: "Your full discography, front and center" },
  { category: "Media", feature: "Videos", free: "1 video", premium: "Unlimited", upgradeHook: "Live sets, music videos, behind the scenes" },
  { category: "Media", feature: "Tabbed Media Library (Photos/Videos/Mixes)", free: false, premium: true, upgradeHook: "Organized, searchable, impressive" },
  // Events & Booking
  { category: "Booking", feature: "Upcoming Shows (display)", free: "Max 3", premium: "Unlimited", upgradeHook: "Show your full schedule — build buzz" },
  { category: "Booking", feature: "Booking Contact Details", free: true, premium: true },
  { category: "Booking", feature: "Fee Range Display", free: true, premium: true },
  { category: "Booking", feature: "Booking Packages (Club/Festival/Private)", free: false, premium: true, upgradeHook: "Close deals faster with pre-built packages" },
  { category: "Booking", feature: "Availability Calendar", free: false, premium: true, upgradeHook: "Let organizers self-check your schedule" },
  { category: "Booking", feature: "Priority Booking CTA (with response time)", free: false, premium: true, upgradeHook: "94% booking rate shown = more conversions" },
  { category: "Booking", feature: "Professional Team (Manager / Agent)", free: false, premium: true, upgradeHook: "Serious DJs have teams — look the part" },
  // Reviews
  { category: "Credibility", feature: "Fan Reviews & Rating Display", free: true, premium: true },
  { category: "Credibility", feature: "Rating Distribution Breakdown", free: true, premium: true },
  { category: "Credibility", feature: "Organizer / Venue Endorsements", free: false, premium: true, upgradeHook: "Industry trust = premium bookings" },
  // Analytics
  { category: "Analytics", feature: "Performance Insights Dashboard", free: false, premium: true, upgradeHook: "Know who's visiting and why they book" },
  { category: "Analytics", feature: "Top Cities (Audience Map)", free: false, premium: true, upgradeHook: "Target your marketing where fans are" },
  { category: "Analytics", feature: "Audience Age & Traffic Breakdown", free: false, premium: true, upgradeHook: "Real data for sponsors & festival pitches" },
  { category: "Analytics", feature: "Profile Views Tracking", free: false, premium: true },
  { category: "Analytics", feature: "Booking Request Tracking", free: false, premium: true },
  // Visibility
  { category: "Visibility", feature: "Standard Search Listing", free: true, premium: true },
  { category: "Visibility", feature: "Featured / Boosted Placement", free: false, premium: true, upgradeHook: "10x more visibility in search results" },
  { category: "Visibility", feature: "Curated DJ Recommendations", free: false, premium: true, upgradeHook: "Appear in organizer-facing recommendation emails" },
];

const UPGRADE_TRIGGERS = [
  { icon: faChartLine, trigger: "Profile gets 500+ views but zero analytics", emotion: "Curiosity gap", cta: "See who's looking at you" },
  { icon: faLock, trigger: "DJ sees blurred analytics sidebar on their own profile", emotion: "FOMO + frustration", cta: "Unblock your stats" },
  { icon: faBolt, trigger: "Competitor DJ with Premium badge ranks higher in search", emotion: "Competitive urgency", cta: "Get verified and rank first" },
  { icon: faCalendarCheck, trigger: "Organizer can't check availability → bounces", emotion: "Missed opportunity pain", cta: "Add your calendar, close more bookings" },
  { icon: faFireFlameCurved, trigger: "Big festival browsing the directory — Free profile looks thin", emotion: "Shame / professionalism gap", cta: "Look like a headliner, not a hobbyist" },
  { icon: faShield, trigger: "No verified badge next to name → trust drop vs. Premium DJ", emotion: "Status / credibility gap", cta: "Get your blue tick today" },
  { icon: faRocket, trigger: "Booking package page missing → organizer has to email for info", emotion: "Friction removal", cta: "Let packages sell for you 24/7" },
  { icon: faCrown, trigger: "30-day analytics email: '47 organizers visited your profile'", emotion: "Value demonstration", cta: "You're 1 click from converting them" },
];

function Cell({ val }: { val: boolean | string }) {
  if (val === true) return <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-emerald-500" />;
  if (val === false) return <FontAwesomeIcon icon={faXmark} className="h-4 w-4 text-gray-700" />;
  return <span className="text-h_red text-xs font-semibold">{val}</span>;
}

const CATEGORIES = Array.from(new Set(ROWS.map((r) => r.category)));

export default function DjProfileComparePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="text-center mb-14">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-4">
            <FontAwesomeIcon icon={faCrown} className="h-2.5 w-2.5 mr-1" />
            Plan Comparison
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl text-white mb-4">Free vs Premium</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Everything DJs need to get booked, build credibility, and grow their community.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <Link href="/djs/demo-free">
              <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5">
                View Free Profile
              </Button>
            </Link>
            <Link href="/djs/demo-premium">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold">
                <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5 mr-2" />
                View Premium Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden mb-16">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_160px] bg-h_blackLight/60 border-b border-white/8">
            <div className="p-5">
              <span className="text-gray-500 text-sm font-semibold">Feature</span>
            </div>
            <div className="p-5 text-center border-l border-white/8">
              <span className="text-white text-sm font-bold">Free</span>
              <p className="text-gray-500 text-xs mt-0.5">£0 / mo</p>
            </div>
            <div className="p-5 text-center border-l border-amber-500/20 bg-amber-500/5">
              <div className="flex items-center justify-center gap-1.5">
                <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-400 text-sm font-bold">Premium</span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5">£19 / mo</p>
            </div>
          </div>

          {CATEGORIES.map((cat) => {
            const catRows = ROWS.filter((r) => r.category === cat);
            return (
              <div key={cat}>
                {/* Category header */}
                <div className="px-5 py-2.5 bg-white/2 border-b border-white/5">
                  <span className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">{cat}</span>
                </div>
                {catRows.map((row, i) => (
                  <div key={row.feature}
                    className={`grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_160px] border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/1"}`}>
                    <div className="p-4 flex flex-col justify-center">
                      <span className="text-gray-300 text-sm">{row.feature}</span>
                      {row.upgradeHook && (
                        <span className="text-gray-600 text-xs mt-0.5 italic">{row.upgradeHook}</span>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-center border-l border-white/5">
                      <Cell val={row.free} />
                    </div>
                    <div className="p-4 flex items-center justify-center border-l border-amber-500/10 bg-amber-500/3">
                      <Cell val={row.premium} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Upgrade Triggers Section */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl text-white mb-2">What Makes DJs Upgrade</h2>
            <p className="text-gray-500 text-sm">Designed psychological triggers that convert Free users to Premium</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {UPGRADE_TRIGGERS.map((t, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/8 bg-h_blackLight/20 hover:border-white/15 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-h_red/10 border border-h_red/20 flex items-center justify-center shrink-0 mt-0.5">
                    <FontAwesomeIcon icon={t.icon} className="h-3.5 w-3.5 text-h_red" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold mb-1">{t.trigger}</p>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] mb-2">{t.emotion}</Badge>
                    <p className="text-h_red text-xs font-medium flex items-center gap-1">
                      <FontAwesomeIcon icon={faArrowRight} className="h-2.5 w-2.5" />
                      {t.cta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="p-8 rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/8 via-transparent to-transparent text-center">
          <FontAwesomeIcon icon={faCrown} className="h-8 w-8 text-amber-400 mb-4" />
          <h2 className="font-heading text-3xl text-white mb-2">Start Free. Upgrade When You&apos;re Ready.</h2>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
            Every DJ on DJscovery starts with a professional free profile. Premium unlocks the tools that turn visibility into bookings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/djs/demo-free">
              <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/5">
                See Free Profile
              </Button>
            </Link>
            <Link href="/djs/demo-premium">
              <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8">
                <FontAwesomeIcon icon={faCrown} className="h-3.5 w-3.5 mr-2" />
                See Premium Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
