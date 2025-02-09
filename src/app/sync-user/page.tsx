import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const SyncUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not found");
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  const userEmail = user.emailAddresses[0]?.emailAddress;
  if (!userEmail) {
    return notFound();
  }

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
      id: userId, // Generate a UUID for the id field
      emailAddress: userEmail,
      imageUrl: user.imageUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      credits: 150, // Default credits as per your schema
    },
  });

  return redirect("/dashboard");
};

export default SyncUser;
