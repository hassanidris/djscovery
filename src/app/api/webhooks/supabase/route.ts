import prisma from "@/lib/client";
import { createHmac } from "crypto";

// Configure this webhook in:
// Supabase Dashboard → Database → Webhooks → Create new webhook
// Table: auth.users  |  Events: INSERT, DELETE
// HTTP URL: https://your-domain.com/api/webhooks/supabase
// Add header: x-webhook-secret = <SUPABASE_WEBHOOK_SECRET from .env.local>

function verifySecret(body: string, incomingSecret: string | null): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return incomingSecret === expected;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-secret");

  if (!verifySecret(rawBody, signature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: { type: string; record: Record<string, string> };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { type, record } = payload;

  // New user signed up via Supabase Auth
  if (type === "INSERT") {
    const email = record.email ?? "";
    const username = email.split("@")[0] + "_" + record.id.slice(0, 6);

    try {
      await prisma.user.upsert({
        where: { id: record.id },
        update: { email },
        create: {
          id: record.id,
          email,
          username,
          role: "FAN",
        },
      });
      return new Response("User created", { status: 200 });
    } catch (err) {
      console.error("Webhook user create failed:", err);
      return new Response("Failed to create user", { status: 500 });
    }
  }

  // User deleted from Supabase Auth — soft delete in our DB
  if (type === "DELETE") {
    try {
      await prisma.user.update({
        where: { id: record.id },
        data: { deletedAt: new Date() },
      });
      return new Response("User soft-deleted", { status: 200 });
    } catch (err) {
      console.error("Webhook user delete failed:", err);
      return new Response("Failed to delete user", { status: 500 });
    }
  }

  return new Response("Event ignored", { status: 200 });
}
