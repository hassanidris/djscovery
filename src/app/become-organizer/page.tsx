import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import { createOrganizerProfile } from "@/lib/actions/profile";
import Footer from "@/components/Footer";

export default async function BecomeOrganizerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  const existing = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
  });
  if (existing) redirect("/");

  return (
    <>
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-h_red/20 border border-h_red/40 mb-2">
              <span className="text-2xl">🎪</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Set Up Your Organizer Profile
            </h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              As an organizer you can post gigs, manage events, and connect
              with DJs on the platform.
            </p>
          </div>

          <form
            action={createOrganizerProfile}
            className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">
                Business / Event Name <span className="text-h_red">*</span>
              </label>
              <input
                type="text"
                name="businessName"
                placeholder="e.g. Nolimits Events"
                required
                minLength={2}
                maxLength={80}
                className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">
                Phone{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+1 555 000 0000"
                maxLength={30}
                className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-h_red hover:bg-h_redDark text-white font-bold py-3 rounded-lg transition-colors"
            >
              Create Organizer Profile
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
