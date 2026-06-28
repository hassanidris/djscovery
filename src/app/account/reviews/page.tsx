import { redirect } from "next/navigation";
import { getNavUser } from "@/lib/auth/getNavUser";
import MyReviewsContent from "@/components/fan/MyReviewsContent";

export const dynamic = "force-dynamic";
export const metadata = { title: "My Reviews" };

export default async function ReviewsPage() {
  const { navRole } = await getNavUser();
  if (navRole === "fan") redirect("/fan/reviews");

  return <MyReviewsContent />;
}
