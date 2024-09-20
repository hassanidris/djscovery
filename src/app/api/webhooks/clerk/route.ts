import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

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
    try {
      // Check if the username already exists
      const existingUser = await prisma.user.findUnique({
        where: {
          username: JSON.parse(body).data.username,
        },
      });

      if (existingUser) {
        return new Response("Username already exists!", { status: 400 });
      }

      await prisma.user.create({
        data: {
          id: evt.data.id,
          username: JSON.parse(body).data.username,
          avatar: JSON.parse(body).data.image_url || "/noAvatar.png",
          cover: "/noCover.png",
        },
      });
      return new Response("User has been created!", { status: 200 });
    } catch (err: any) {
      if (err.code === "P2002") {
        return new Response("Duplicate entry for unique field!", {
          status: 400,
        });
      }
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
      await prisma.user.update({
        where: {
          id: evt.data.id,
        },
        data: {
          username: JSON.parse(body).data.username,
          avatar: JSON.parse(body).data.image_url || "/noAvatar.png",
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
