import prisma from "@/lib/client";

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h after start

  await prisma.event.updateMany({
    where: {
      status: "PUBLISHED",
      startDate: { lt: cutoff },
    },
    data: { status: "COMPLETED" },
  });

  return new Response("OK");
}
