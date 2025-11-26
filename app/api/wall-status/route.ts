// app/api/wall-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

const WALL_TOTALS: Record<string, number> = {
  m: 1000,
  m2: 10000,
  m3: 100000,
};

function normaliseWallSlug(raw: string | null): string {
  const slug = (raw || "").trim().toLowerCase();
  if (!slug) return "m";
  if (slug === "m²" || slug === "m2") return "m2";
  if (slug === "m³" || slug === "m3") return "m3";
  return slug;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallSlug = normaliseWallSlug(searchParams.get("wallSlug"));

    const totalTiles = WALL_TOTALS[wallSlug] ?? WALL_TOTALS["m"];

    const filled = await prisma.memory.count({
      where: { wallSlug },
    });

    const isFull = filled >= totalTiles;

    return NextResponse.json(
      {
        wallSlug,
        totalTiles,
        filled,
        isFull,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/wall-status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
