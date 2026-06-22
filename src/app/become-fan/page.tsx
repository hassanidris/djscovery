import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import { getCountries } from "@/lib/actions/locations";
import BecomeFanForm from "@/components/BecomeFanForm";
import Footer from "@/components/Footer";

export const metadata = { title: "Complete Your Profile" };

export default async function BecomeFanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const [fanProfile, countries] = await Promise.all([
    prisma.fanProfile.findUnique({
      where: { userId: user.id },
      select: { name: true },
    }),
    getCountries(),
  ]);

  return (
    <>
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-h_red/20 border border-h_red/40 mb-2">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Complete Your Profile
            </h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Add a few details so other fans, DJs, and organizers can get to
              know you on DJcovery.
            </p>
          </div>

          <BecomeFanForm
            initialName={fanProfile?.name ?? ""}
            countries={countries}
          />
        </div>
      </div>
      <Footer />
    </>
  );
}
