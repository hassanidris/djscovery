import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/client";
import { redirect } from "next/navigation";
import { createDjProfile } from "@/lib/actions/profile";
import Footer from "@/components/Footer";

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

  return (
    <>
      <div className="min-h-[calc(100vh-96px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-h_red/20 border border-h_red/40 mb-2">
              <span className="text-2xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Set Up Your DJ Profile</h1>
            <p className="text-gray-400 text-sm max-w-sm mx-auto">
              Your profile will be reviewed by our team before going live on the
              directory. Fill in the basics to get started.
            </p>
          </div>

          <form
            action={createDjProfile}
            className="bg-white/5 border border-white/10 rounded-xl p-8 flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">
                DJ Stage Name <span className="text-h_red">*</span>
              </label>
              <input
                type="text"
                name="stageName"
                placeholder="e.g. DJ Echo"
                required
                minLength={2}
                maxLength={60}
                className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-gray-300 font-medium">
                Bio{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <textarea
                name="bio"
                placeholder="Tell fans about yourself, your style, your influences..."
                rows={4}
                maxLength={500}
                className="bg-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 outline-none ring-1 ring-white/20 focus:ring-h_red transition-all resize-none"
              />
              <p className="text-gray-600 text-xs">Max 500 characters</p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3">
              <p className="text-yellow-400 text-xs leading-relaxed">
                ⏳ Your profile will be{" "}
                <strong>pending admin approval</strong> before it appears
                publicly. You can still update your profile while waiting.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-h_red hover:bg-h_redDark text-white font-bold py-3 rounded-lg transition-colors"
            >
              Create DJ Profile
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
