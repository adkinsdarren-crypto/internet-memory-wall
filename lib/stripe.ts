// lib/stripe.ts
import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20", // or latest supported version
});
