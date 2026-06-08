import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import BecomeOrganizerForm from "@/components/BecomeOrganizerForm";
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
              As an organizer you can post gigs, manage events, and connect with
              DJs on the platform.
            </p>
          </div>

          <BecomeOrganizerForm />
        </div>
      </div>
      <Footer />
    </>
  );
}
