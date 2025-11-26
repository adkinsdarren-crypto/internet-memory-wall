// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";

const DEFAULT_WALL_SLUG = "m";
const MAX_TILES_M = 1_000_000;

type CheckoutBody = {
  tileIndex?: number | null;
  wallSlug?: string | null;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as CheckoutBody;

    const tileIndex =
      typeof body.tileIndex === "number" ? body.tileIndex : null;
    const wallSlug =
      (body.wallSlug || DEFAULT_WALL_SLUG).trim() || DEFAULT_WALL_SLUG;

    if (tileIndex === null || Number.isNaN(tileIndex)) {
      return NextResponse.json(
        { error: "A valid tileIndex is required to start checkout." },
        { status: 400 }
      );
    }

    if (wallSlug === "m") {
      if (tileIndex < 0 || tileIndex >= MAX_TILES_M) {
        return NextResponse.json(
          { error: "Invalid tile index for this wall." },
          { status: 400 }
        );
      }
    }

    const priceId = process.env.STRIPE_PRICE_TILE;

    if (!priceId) {
      console.error(
        "Checkout error: STRIPE_PRICE_TILE env var is missing or empty."
      );
      return NextResponse.json(
        { error: "Stripe price ID is not configured (STRIPE_PRICE_TILE)." },
        { status: 500 }
      );
    }

    const originHeader = req.headers.get("origin");
    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const baseUrl = originHeader || envSiteUrl || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        tileIndex: String(tileIndex),
        wallSlug,
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("🔥 STRIPE CHECKOUT ERROR:", err);

    return NextResponse.json(
      {
        error: "Unable to create checkout session.",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
