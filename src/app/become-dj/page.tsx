import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
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
  });
  if (existing) redirect("/");

  const [countries, genres] = await Promise.all([
    prisma.country.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    }),
    prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <>
      <div className="min-h-[calc(100vh-96px)] px-4 py-12">
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-h_red/20 border border-h_red/40 mb-2">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Set Up Your DJ Profile
            </h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Your profile will be reviewed by our team before going live on the
              directory. Fill in your details to get started.
            </p>
          </div>

          <BecomeDjForm
            countries={countries}
            initialGenres={genres}
            userId={user.id}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
