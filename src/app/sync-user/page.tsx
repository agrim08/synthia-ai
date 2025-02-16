export const dynamic = "force-dynamic";

import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const SyncUser = async () => {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not found");
    }

    // Retrieve the user from Clerk.
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      return notFound();
    }

    // Upsert the user in your database.
    await db.user.upsert({
      where: {
        emailAddress: userEmail,
      },
      update: {
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      create: {
        id: userId, // Use the provided userId.
        emailAddress: userEmail,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: 150, // Default credits as per your schema.
      },
    });

    return redirect("/dashboard");
  } catch (error) {
    console.error("Error syncing user:", error);
    throw error;
  }
};

export default SyncUser;
