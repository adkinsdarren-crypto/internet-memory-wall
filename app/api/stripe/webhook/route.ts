// app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../../lib/stripe";
import { prisma } from "../../../../lib/prisma";
import Stripe from "stripe";



async function buffer(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Missing STRIPE_WEBHOOK_SECRET", {
      status: 500,
    });
  }

  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing stripe-signature header");
    return new NextResponse("Missing stripe-signature header", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await buffer(
      req.body as unknown as ReadableStream<Uint8Array>
    );

    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(
      "❌ Stripe webhook signature verification failed:",
      err.message
    );
    return new NextResponse(`Webhook Error: ${err.message}`, {
      status: 400,
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const tileIndexRaw = session.metadata?.tileIndex;
      const wallSlugFromMeta = session.metadata?.wallSlug;
      const wallSlug = (wallSlugFromMeta || "m").trim() || "m";

      const tileIndex =
        typeof tileIndexRaw === "string" ? Number(tileIndexRaw) : NaN;

      if (!Number.isFinite(tileIndex)) {
        console.warn(
          "checkout.session.completed without valid tileIndex in metadata"
        );
      } else {
        console.log(
          `💰 Payment completed for wall "${wallSlug}" tile #${tileIndex + 1}`
        );

        // 1) Mark this tile as paid in the PaidTile table (for audit)
        await prisma.paidTile.upsert({
          where: {
            wallSlug_tileIndex: {
              wallSlug,
              tileIndex,
            },
          },
          create: {
            wallSlug,
            tileIndex,
            stripeSessionId: session.id,
          },
          update: {
            stripeSessionId: session.id,
          },
        });

        // 2) Upgrade any existing draft memory on this wall/tile
        const result = await prisma.memory.updateMany({
          where: {
            wallSlug,
            tileIndex,
          },
          data: {
            paid: true,
            published: true, // 🔥 THIS is what makes it appear on the wall
          },
        });

        if (result.count === 0) {
          console.warn(
            `⚠️ No draft memory found for wall "${wallSlug}" tile #${
              tileIndex + 1
            } when processing checkout.session.completed`
          );
        } else {
          console.log(
            `✅ Upgraded ${result.count} memory record(s) to paid+published for wall "${wallSlug}" tile #${
              tileIndex + 1
            }`
          );
        }
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (err: any) {
    console.error("❌ Error in Stripe webhook handler:", err);
    return new NextResponse("Webhook handler failed", {
      status: 500,
    });
  }
}
