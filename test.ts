import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCheckoutSession(credits: number) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const session = await stripe.checkout.session.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${credits} Synthia Credits`,
          },
          unit_amount: Math.round((credits / 50) * 100),
        },
        quantity: 1,
      },
    ],
    customer_creation: "always",
    mode: "subscription",
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    client_reference_id: userId.toString(),
    metadata: {
      credits,
    },
  });
  return redirect(session.url!);
}
