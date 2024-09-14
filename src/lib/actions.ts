"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";
// import { z } from "zod";
// import { revalidatePath } from "next/cache";

// export const switchFollow = async (userId: string) => {
//   const { userId: currentUserId } = auth();

//   if (!currentUserId) {
//     throw new Error("User is not authenticated!");
//   }

// };

export const updateInformation = async (formData: FormData) => {
  const fields = Object.fromEntries(formData);

  const filteredFields = Object.fromEntries(
    Object.entries(fields).filter(([_, value]) => value !== "")
  );

  // Log the received fields for debugging purposes
  // console.log("Fields received:", fields);

  // Parse genres field if present
  if (fields.genres) {
    try {
      fields.genres = JSON.parse(fields.genres as string);
    } catch (error) {
      console.error("Error parsing genres:", error);
      return "err";
    }
  }

  // Define schema to validate user profile input
  const Profile = z.object({
    cover: z.string().optional(),
    stageName: z.string().max(60).optional(),
    realName: z.string().max(60).optional(),
    city: z.string().max(60).optional(),
    country: z.string().max(60).optional(),
    genres: z.array(z.string()).optional(),
    bio: z.string().max(60).optional(),
  });

  // Validate fields with schema
  const validatedFields = Profile.safeParse(filteredFields);

  if (!validatedFields.success) {
    console.log(
      "Validation errors:",
      validatedFields.error.flatten().fieldErrors
    );
    return "err";
  }

  const { userId } = auth();
  if (!userId) {
    return "err"; // Return error if no authenticated user is found
  }

  const dataToUpdate = validatedFields.data;

  // Fetch genre IDs based on genre names before updating the user's genres
  if (dataToUpdate.genres && dataToUpdate.genres.length > 0) {
    const genreIds = await prisma.genre.findMany({
      where: {
        name: { in: dataToUpdate.genres }, // Match genres by their names
      },
      select: { id: true },
    });

    // Check if all requested genres are found
    if (genreIds.length === 0) {
      return "No matching genres found"; // Return error if no genres were found
    } else if (genreIds.length < dataToUpdate.genres.length) {
      console.log("Some genres were not found in the database.");
      return "Some genres were not found"; // Optionally handle partial matches
    }

    // Set user's genres with the retrieved genre IDs
    dataToUpdate.genres = {
      set: genreIds.map((genre) => ({ id: genre.id })), // Format required by Prisma
    };
  }

  // Clean up undefined fields, since Prisma does not accept undefined values
  const cleanData = Object.fromEntries(
    Object.entries(dataToUpdate).filter(([_, value]) => value !== undefined)
  );

  try {
    // Update the user's information in the database
    const updatedUser = await prisma.user.update({
      where: {
        id: userId, // Match the user by their ID
      },
      data: cleanData, // Update the cleaned data
    });

    console.log("User updated successfully:", updatedUser); // Log success (optional)
    return "success";
  } catch (err) {
    console.log("Prisma update error:", err);
    return "err";
  }
};

export const addEvent = async (formData: FormData) => {
  const fields = Object.fromEntries(formData);

  console.log("Fields event received:", fields);

  const Event = z.object({
    clubName: z.string().min(1, "Title is required"),
    eventName: z.string().max(1).optional(),
    date: z.string().optional(),
    location: z.string().optional(),
    dressCode: z.string().optional(),
    entryFees: z.string().optional(),
    eventUrl: z.string().optional(),
    mapUrl: z.string().optional(),
    // attendees: z.array(z.string()).optional(),
  });

  const validatedEventFields = Event.safeParse(fields);

  if (!validatedEventFields.success) {
    console.log(validatedEventFields.error.flatten().fieldErrors);
  }
  const { userId } = auth();
  const event = validatedEventFields.data;

  if (!userId) {
    return "err";
  }

  try {
    await prisma.event.create({
      data: {
        ...event, // Spread the validated event data
        userId: userId, // Associate the event with the user
      },
    });
  } catch (err) {
    console.log(err);
  }

  // const filteredEventFields = Object.fromEntries(
  //   Object.entries(fields).filter(([_, value]) => value !== "")
  // );

  // // Validate fields with schema

  // if (!validatedEventFields.success) {
  //   console.log(
  //     "Validation errors:",
  //     validatedEventFields.error.flatten().fieldErrors
  //   );
  //   return "err";
  // }

  // const { userId } = auth();

  // if (!userId) throw new Error("User is not authenticated!");

  // // Parse and adjust fields before saving
  // const eventData = {
  //   ...validatedEventFields.data,
  //   userId: userId,
  //   date: validatedEventFields.data.date
  //     ? new Date(validatedEventFields.data.date)
  //     : undefined, // Convert date string to Date object
  //   entryFees: validatedEventFields.data.entryFees
  //     ? parseFloat(validatedEventFields.data.entryFees)
  //     : undefined, // Convert entryFees string to number
  // };

  // // Remove undefined fields to avoid issues with Prisma
  // const cleanEventData = Object.fromEntries(
  //   Object.entries(eventData).filter(([_, value]) => value !== undefined)
  // );

  // try {
  //   await prisma.event.create({

  //     data: {
  //       fields: eventData,
  //     userId,
  //     },
  //     include: {
  //       user: true,
  //     }
  //   });
  // } catch (err) {
  //   console.log("Error creating event:", err);
  //   throw new Error("Failed to create event");
  // }
};
