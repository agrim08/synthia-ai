import { NextResponse } from "next/server";
import crypto from "crypto";
import axios from "axios";
import crc from "crc";
import { db } from "@/server/db"; // Prisma client instance

// Your webhook ID from PayPal Developer Dashboard
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

async function verifyWebhook(req: Request): Promise<boolean> {
  try {
    // Retrieve required headers
    const transmissionId = req.headers.get("paypal-transmission-id");
    const transmissionTime = req.headers.get("paypal-transmission-time");
    const certUrl = req.headers.get("paypal-cert-url");
    const authAlgo = req.headers.get("paypal-auth-algo");
    const transmissionSig = req.headers.get("paypal-transmission-sig");

    if (
      !transmissionId ||
      !transmissionTime ||
      !certUrl ||
      !authAlgo ||
      !transmissionSig
    ) {
      console.error("Missing one or more webhook headers");
      return false;
    }

    // Read raw request body
    const bodyText = await req.text();

    // Compute CRC32 (ensuring a positive number)
    const crc32Value = crc.crc32(bodyText) >>> 0;

    // Build the expected string as: <transmissionId>|<transmissionTime>|<webhookId>|<crc32>
    const expectedString = [
      transmissionId,
      transmissionTime,
      WEBHOOK_ID,
      crc32Value,
    ].join("|");

    // Ensure the certificate URL is from PayPal
    const urlObj = new URL(certUrl);
    if (!urlObj.hostname.endsWith(".paypal.com")) {
      console.error("Certificate URL is not from PayPal");
      return false;
    }

    // Fetch the public certificate
    const certResponse = await axios.get(certUrl);
    const cert = certResponse.data;

    // Verify the signature using the provided algorithm
    const verifier = crypto.createVerify(authAlgo);
    verifier.update(expectedString);
    verifier.end();

    const isValid = verifier.verify(cert, transmissionSig, "base64");
    return isValid;
  } catch (error) {
    console.error("Webhook verification failed:", error);
    return false;
  }
}

// Helper to extract credits from the purchase unit description
function extractCredits(description: string): number | null {
  // Assumes description follows the format: "10 Synthia Credits"
  const match = description.match(/(\d+)\s*Synthia Credits/i);
  return match && match[1] ? Number(match[1]) : null;
}

export async function POST(request: Request) {
  // Verify webhook signature
  const isValid = await verifyWebhook(request);
  if (!isValid) {
    return new NextResponse(
      JSON.stringify({ error: "Invalid webhook signature" }),
      { status: 400 },
    );
  }

  // Since verifyWebhook consumed the body text, re-read it:
  const bodyText = await request.text();
  const eventData = JSON.parse(bodyText);
  console.log("Received PayPal webhook event:", eventData);

  // Process only specific event type, e.g., PAYMENT.CAPTURE.COMPLETED
  if (eventData.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    try {
      const resource = eventData.resource;
      const purchaseUnits = resource.purchase_units;
      if (!purchaseUnits || purchaseUnits.length === 0) {
        console.error("No purchase units in webhook payload");
        return new NextResponse(
          JSON.stringify({ error: "No purchase units found" }),
          { status: 400 },
        );
      }
      const purchaseUnit = purchaseUnits[0];
      const userId = purchaseUnit.custom_id; // Set during order creation
      const description = purchaseUnit.description;
      const credits = extractCredits(description);

      if (!userId || !credits) {
        console.error("Missing userId or credits in webhook payload");
        return new NextResponse(
          JSON.stringify({ error: "Missing userId or credits" }),
          { status: 400 },
        );
      }

      // Update database: record the transaction and increment user's credits
      await db.payPalTransaction.create({
        data: { userId, credits },
      });
      await db.user.update({
        where: { id: userId },
        data: {
          credits: { increment: credits },
        },
      });
      console.log(`Added ${credits} credits for user ${userId}`);
    } catch (error) {
      console.error("Error processing webhook event:", error);
      return new NextResponse(
        JSON.stringify({ error: "Error processing event" }),
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ received: true });
}
