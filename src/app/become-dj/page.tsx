import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import Footer from "@/components/Footer";
import BecomeDjForm from "@/components/BecomeDjForm";

export default async function BecomeDjPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const existing = await prisma.djProfile.findUnique({
    where: { userId: user.id },
    select: { slug: true, status: true },
  });

  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, code: true },
  });

  return (
    <>
      <div className="min-h-[calc(100vh-96px)] px-4 py-12">
        <div className="mx-auto w-full max-w-2xl">
          <div className="mb-10 space-y-2 text-center">
            <div className="bg-h_red/20 border-h_red/40 mb-2 inline-flex h-14 w-14 items-center justify-center rounded-full border">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Set Up Your DJ Profile
            </h1>
            <p className="mx-auto max-w-sm text-sm text-gray-400">
              Your profile will be reviewed by our team before going live on the
              directory. Fill in your details to get started.
            </p>
          </div>

          {existing ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="font-medium text-white">
                You already have a DJ profile.
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Status:{" "}
                <span className="capitalize">
                  {existing.status.toLowerCase()}
                </span>
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href={`/djs/${existing.slug}`}
                  className="bg-h_red hover:bg-h_redDark inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  View profile
                </Link>
                <Link
                  href="/settings/dj"
                  className="inline-flex items-center justify-center rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  Edit profile
                </Link>
              </div>
            </div>
          ) : (
            <BecomeDjForm countries={countries} userId={user.id} />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
