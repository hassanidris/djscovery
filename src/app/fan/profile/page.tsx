import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import {
  Settings,
  Users,
  CalendarHeart,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "My Profile" };

function profileCompleteness(profile: {
  bio: string | null;
  avatar: string | null;
  countryId: number | null;
  cityId: number | null;
}): { score: number; missing: string[] } {
  const checks: [boolean, string][] = [
    [!!profile.bio, "Add a bio"],
    [!!profile.avatar, "Upload a profile photo"],
    [!!profile.countryId, "Set your country"],
    [!!profile.cityId, "Set your city"],
  ];
  const missing = checks.filter(([ok]) => !ok).map(([, label]) => label);
  const score = Math.round(
    ((checks.length - missing.length) / checks.length) * 100,
  );
  return { score, missing };
}

export default async function FanProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const fanProfile = await prisma.fanProfile.findUnique({
    where: { userId: user.id },
    select: {
      name: true,
      bio: true,
      avatar: true,
      countryId: true,
      cityId: true,
      country: { select: { name: true } },
      city: { select: { name: true } },
    },
  });

  if (!fanProfile) redirect("/become-fan");

  const [followedDjsCount, savedEventsCount] = await Promise.all([
    prisma.djFollow.count({ where: { userId: user.id } }),
    prisma.savedEvent.count({ where: { userId: user.id } }),
  ]);

  const { score, missing } = profileCompleteness(fanProfile);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Overview</h2>
        <Button variant="outline" size="sm" asChild>
          <Link href="/fan/settings">
            <Settings className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Followed DJs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{followedDjsCount}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Saved Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{savedEventsCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile completeness */}
      {missing.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">
                  Complete your profile
                </span>
              </div>
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-400"
              >
                {score}%
              </Badge>
            </div>

            <Progress
              value={score}
              className="mb-4 h-1.5 bg-white/10 *:data-[slot=progress-indicator]:bg-amber-400"
            />

            <ul className="mb-4 flex flex-col gap-1.5">
              {missing.map((item) => (
                <li
                  key={item}
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
                  {item}
                </li>
              ))}
            </ul>

            <Button variant="outline" size="sm" asChild>
              <Link href="/fan/settings">
                <Settings className="h-3.5 w-3.5" />
                Complete profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {score === 100 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="flex items-center gap-2 py-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-green-300">
              Your profile is 100% complete.
            </span>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Quick links */}
      <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
        Quick Links
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="hover:border-h_red/40 hover:bg-h_red/5 transition-colors">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-h_red/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Users className="text-h_red h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse DJs</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Discover and follow DJs you love
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/directory">Go →</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/20 transition-colors">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <CalendarHeart className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">Browse Events</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                Find upcoming events near you
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/events">Go →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
