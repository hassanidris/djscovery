import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local",
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred", {
      status: 400,
    });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === "user.created") {
    const data = JSON.parse(body).data;
    const emailLocalPart =
      data.email_addresses?.[0]?.email_address?.split("@")[0];
    const username =
      data.username ?? `${emailLocalPart ?? "user"}_${evt.data.id}`;
    try {
      await prisma.user.upsert({
        where: { id: evt.data.id },
        update: {},
        create: {
          id: evt.data.id,
          username,
          avatar: data.image_url || "/noAvatar.png",
          cover: "/noCover.png",
        },
      });
      return new Response("User has been created!", { status: 200 });
    } catch (err) {
      console.log(err);
      return new Response("Failed to create the user!", { status: 500 });
    }
  }

  // if (eventType === "user.updated") {
  //   try {
  //     await prisma.user.update({
  //       where: {
  //         id: evt.data.id,
  //       },
  //       data: {
  //         username: JSON.parse(body).data.username,
  //         avatar: JSON.parse(body).data.image_url || "/noAvatar.png",
  //       },
  //     });
  //     return new Response("User has been updated!", { status: 200 });
  //   } catch (err) {
  //     console.log(err);
  //     return new Response("Failed to update the user!", { status: 500 });
  //   }
  // }

  if (eventType === "user.updated") {
    try {
      // Check if the user exists first
      const existingUser = await prisma.user.findUnique({
        where: {
          id: evt.data.id,
        },
      });

      if (!existingUser) {
        return new Response("User not found!", { status: 404 });
      }

      // Proceed with the update if the user exists
      const updateData = JSON.parse(body).data;
      const updateEmailLocalPart =
        updateData.email_addresses?.[0]?.email_address?.split("@")[0];
      const updateUsername =
        updateData.username ??
        `${updateEmailLocalPart ?? "user"}_${evt.data.id}`;
      await prisma.user.update({
        where: {
          id: evt.data.id,
        },
        data: {
          username: updateUsername,
          avatar: updateData.image_url || "/noAvatar.png",
        },
      });
      return new Response("User has been updated!", { status: 200 });
    } catch (err) {
      console.log(err);
      return new Response("Failed to update the user!", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
