import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import prisma from "@/lib/client";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  MapPin,
  Calendar,
  Music,
  Globe,
  Mail,
  Phone,
  Crown,
  EyeOff,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { approveDjProfile, rejectDjProfile } from "@/lib/actions/admin/djs";
import AdminActionButton from "@/components/admin/AdminActionButton";

export default async function AdminDjReviewPage({
  params,
}: {
  params: Promise<{ djId: string }>;
}) {
  const { djId } = await params;

  // Validate djId is a valid number
  const djProfileId = Number(djId);
  if (isNaN(djProfileId) || djProfileId <= 0) {
    return notFound();
  }

  // Verify admin access (checks auth, role, user status, and deletedAt)
  const { userId } = await requireAdmin();

  const dj = await prisma.djProfile.findUnique({
    where: { id: djProfileId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
        },
      },
      city: true,
      country: true,
      genres: { include: { genre: true } },
      djTypes: true,
      socialLinks: true,
      ratings: {
        take: 20,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { username: true, image: true, name: true } },
        },
      },
      media: {
        take: 50,
        orderBy: { createdAt: "desc" },
      },
      packages: true,
      highlights: true,
      endorsements: true,
      pressItems: true,
      eventsOwned: {
        where: { status: { in: ["PUBLISHED", "COMPLETED"] }, deletedAt: null },
        take: 15,
        orderBy: { startDate: "asc" },
        include: { city: true, country: true },
      },
      reputationDetail: true,
      _count: {
        select: { ratings: true, followers: true },
      },
    },
  });

  if (!dj) return notFound();

  const [ratingAgg, mediaCount, publicEventsCount] = await Promise.all([
    prisma.djRating.aggregate({
      where: { djProfileId: dj.id },
      _avg: { rating: true },
    }),
    prisma.media.count({
      where: { djProfileId: dj.id },
    }),
    prisma.event.count({
      where: {
        ownerDjId: dj.id,
        status: { in: ["PUBLISHED", "COMPLETED"] },
        deletedAt: null,
      },
    }),
  ]);
  const avgRating = ratingAgg._avg.rating ?? 0;

  const STATUS_COLORS: Record<string, string> = {
    APPROVED: "border-green-500/30 bg-green-500/10 text-green-400",
    PENDING_APPROVAL: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/djs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to DJs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{dj.stageName}</h1>
            <p className="text-muted-foreground text-sm">@{dj.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dj.featured && (
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              <Crown className="mr-1 h-3 w-3" />
              Featured
            </Badge>
          )}
          {dj.hidden && (
            <Badge className="border-gray-500/30 bg-gray-500/10 text-gray-400">
              <EyeOff className="mr-1 h-3 w-3" />
              Hidden
            </Badge>
          )}
          <Badge className={`border text-xs ${STATUS_COLORS[dj.status] ?? ""}`}>
            {dj.status === "PENDING_APPROVAL" ? "Pending" : dj.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Profile Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-muted-foreground text-sm">Email</label>
                <p className="text-white">{dj.user.email}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Booking Email
                </label>
                <p className="text-white">{dj.bookingEmail || "—"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Booking Phone
                </label>
                <p className="text-white">{dj.bookingPhone || "—"}</p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Location
                </label>
                <p className="flex items-center gap-1 text-white">
                  <MapPin className="h-3 w-3" />
                  {[dj.city?.name, dj.country?.name]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Fee Range
                </label>
                <p className="text-white">
                  {dj.feeMin || dj.feeMax
                    ? `${dj.feeCurrency || "USD"} ${dj.feeMin || "0"}${dj.feeMax ? ` - ${dj.feeMax}` : ""}`
                    : "—"}
                </p>
              </div>
              <div>
                <label className="text-muted-foreground text-sm">
                  Member Since
                </label>
                <p className="text-white">
                  {formatDistanceToNow(new Date(dj.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-muted-foreground text-sm">Bio</label>
              <p className="mt-1 whitespace-pre-wrap text-white">
                {dj.bio || "—"}
              </p>
            </div>
          </div>

          {/* Genres & DJ Types */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Music Style
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">
                  Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {dj.genres.map((g) => (
                    <Badge
                      key={g.genre.id}
                      className="border border-white/10 bg-white/5 text-gray-300"
                    >
                      {g.genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-muted-foreground mb-2 block text-sm">
                  DJ Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {dj.djTypes.map((dt) => (
                    <Badge
                      key={`${dt.djProfileId}-${dt.type}`}
                      className="border border-white/10 bg-white/5 text-gray-300"
                    >
                      {dt.type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {dj.socialLinks && dj.socialLinks.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Social Links
              </h2>
              <div className="grid gap-2">
                {dj.socialLinks
                  .filter(
                    (link) =>
                      link.url.startsWith("http://") ||
                      link.url.startsWith("https://"),
                  )
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
                    >
                      <Globe className="h-4 w-4" />
                      {link.platform}
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Media */}
          {dj.media.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Media ({mediaCount})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {dj.media.slice(0, 6).map((media) => (
                  <div
                    key={media.id}
                    className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/5"
                  >
                    {media.type === "IMAGE" ? (
                      <Image
                        src={media.url}
                        alt="Media"
                        width={400}
                        height={225}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <Music className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {dj.packages.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Packages ({dj.packages.length})
              </h2>
              <div className="space-y-3">
                {dj.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{pkg.name}</h3>
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                        {pkg.currency} {pkg.priceFrom}
                        {pkg.priceTo && ` - ${pkg.priceTo}`}
                      </Badge>
                    </div>
                    {pkg.duration && (
                      <p className="mt-1 text-sm text-gray-400">
                        {pkg.duration}
                      </p>
                    )}
                    {pkg.features && (
                      <p className="mt-2 text-sm whitespace-pre-wrap text-gray-300">
                        {pkg.features}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Stats</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Rating</span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {avgRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Reviews</span>
                <span className="text-white">{dj._count.ratings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Followers</span>
                <span className="text-white">{dj._count.followers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Events</span>
                <span className="text-white">{publicEventsCount}</span>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="rounded-xl border border-white/8 bg-white/3 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Account Status
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">User Status</span>
                <Badge className="border-white/10 bg-white/5 text-gray-300">
                  {dj.user.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Plan</span>
                <Badge className="border-white/10 bg-white/5 text-gray-300">
                  {dj.plan}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          {dj.status === "PENDING_APPROVAL" && (
            <div className="rounded-xl border border-white/8 bg-white/3 p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Approval Actions
              </h2>
              <div className="space-y-2">
                <AdminActionButton
                  label="Approve Profile"
                  description={`Approve ${dj.stageName}'s DJ profile? They'll receive a notification and their profile will become public.`}
                  confirmLabel="Approve"
                  fields={{ djProfileId: String(dj.id) }}
                  action={approveDjProfile}
                  successMessage="DJ profile approved"
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                />
                <AdminActionButton
                  label="Reject Profile"
                  description={`Reject ${dj.stageName}'s DJ profile? This action cannot be undone.`}
                  confirmLabel="Reject"
                  fields={{ djProfileId: String(dj.id) }}
                  action={rejectDjProfile}
                  successMessage="DJ profile rejected"
                  variant="outline"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                />
              </div>
            </div>
          )}

          {/* View Public Profile */}
          {dj.status === "APPROVED" && (
            <Link href={`/djs/${dj.slug}`} target="_blank">
              <Button variant="outline" className="w-full">
                <Globe className="mr-2 h-4 w-4" />
                View Public Profile
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
