"use server";

import { auth } from "@clerk/nextjs/server";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import { redirect } from "next/navigation";

const configureEnvironment = function () {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  return process.env.NODE_ENV === "production"
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId!, clientSecret!)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId!, clientSecret!);
};

const client = function () {
  return new checkoutNodeJssdk.core.PayPalHttpClient(configureEnvironment());
};

export async function createCheckoutSession(credits: number) {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Calculate amount – for example, if 50 credits = INR 1.00, then:
  const amount = (credits / 50).toFixed(2);

  // Initialize PayPal client
  const paypalClient = client();
  const requestOrder = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  requestOrder.headers["Prefer"] = "return=representation";

  // Set up the order details
  requestOrder.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: amount,
        },
        description: `${credits} Synthia Credits`,
        custom_id: userId.toString(),
      },
    ],
    application_context: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/create`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    },
    // Optionally, if supported by your integration:
    // client_reference_id: userId.toString(),
  });

  // Execute the order creation
  const orderResponse = await paypalClient.execute(requestOrder);
  if (orderResponse.statusCode !== 201) {
    throw new Error("Failed to create PayPal order");
  }

  // Find the approval URL from the returned links
  const approvalLink = orderResponse.result.links.find(
    (link: { rel: string; href: string }) => link.rel === "approve",
  );
  if (!approvalLink) {
    throw new Error("Approval URL not found in order response");
  }

  // Redirect the user to the PayPal approval page
  return redirect(approvalLink.href);
}

export default client;
