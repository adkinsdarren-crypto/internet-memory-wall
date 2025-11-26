"use client";

import React from "react";

const ROUGH_RATES: Record<string, { currency: string; rate: number }> = {
  AU: { currency: "AUD", rate: 1.5 },  // 1 USD ≈ 1.5 AUD (adjust any time)
  EU: { currency: "EUR", rate: 0.9 },
  GB: { currency: "GBP", rate: 0.8 },
};

function guessRegion(): keyof typeof ROUGH_RATES | null {
  if (typeof navigator === "undefined") return null;
  const lang = navigator.language || "";

  if (lang.includes("AU")) return "AU";
  if (lang.includes("GB")) return "GB";
  if (lang.includes("EN")) return null;
  if (lang.includes("de") || lang.includes("fr") || lang.includes("es")) {
    return "EU";
  }
  return null;
}

export default function LocalPrice({ usd }: { usd: number }) {
  const region = guessRegion();
  if (!region) return null;

  const { currency, rate } = ROUGH_RATES[region];
  const approx = usd * rate;

  const formatted = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(approx);

  return (
                        <LocalPrice usd={1} />

  );
}
