// app/api/memories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ---------------------------------------------
// TILE LIMITS — update these if needed
// ---------------------------------------------
const MAX_TILES_BY_WALL: Record<string, number> = {
  m: 1_000_000,
  m2: 10_000_000,
  m3: 100_000_000,
};

// ---------------------------------------------
// INPUT TYPES
// ---------------------------------------------
type CreatePayload = {
  title?: string;
  body?: string;
  authorName?: string;
  accentColor?: string;
  tileIndex?: number | null;
  imageUrl?: string | null;
  imageData?: string | null;
  wallSlug?: string | null;
};

// Normalise wall slugs (m, m², m2, etc.)
function normaliseWallSlug(raw?: string | null): string {
  const slug = (raw || "").trim().toLowerCase();
  if (!slug) return "m";
  if (slug === "m²" || slug === "m2") return "m2";
  if (slug === "m³" || slug === "m3") return "m3";
  return slug;
}

// -----------------------------------------------------------
// 🔥 TEXT MODERATION
// Blocks sexual content, hate, violence, illegal content, etc.
// -----------------------------------------------------------
async function moderateText(text: string): Promise<string | null> {
  try {
    const result = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: text,
    });

    const first = result.results[0];
    if (!first.flagged) return null;

    // Return a readable message for the user
    return `Your memory contains disallowed content. Please rewrite it without:
- Hate or abusive language
- Sexual content
- Graphic violence
- Illegal activity
- Extremist content
- Harassment

Please try again with a revised version.`;
  } catch (err) {
    console.error("Moderation API error:", err);
    // If moderation itself fails, don't expose raw error to user
    return "Content moderation failed. Try again.";
  }
}

// --------------------------------------------------------------------
// 🔥 IMAGE MODERATION (TEMPORARY, NON-BLOCKING)
// Right now we *log* that we'd moderate, but we don't block uploads.
// --------------------------------------------------------------------
async function moderateImage(base64: string): Promise<string | null> {
  try {
    console.log("🔎 Image uploaded (moderation placeholder, not blocking).");
    // TODO: Replace with a real image moderation pipeline if/when needed.
    return null;
  } catch (err) {
    console.error("Image moderation error (non-blocking):", err);
    // IMPORTANT: do NOT block on errors – just allow the image for now.
    return null;
  }
}

// ===================================================================
//  POST — CREATE OR UPDATE DRAFT MEMORY FOR A TILE
//  - First save a draft (paid = false, published = false)
//  - Stripe webhook will later mark it paid + published.
// ===================================================================
export async function POST(req: NextRequest) {
  try {
    const json = (await req.json()) as CreatePayload;

    const {
      title,
      body,
      authorName,
      accentColor,
      tileIndex,
      imageUrl,
      imageData,
    } = json;

    const wallSlug = normaliseWallSlug(json.wallSlug);

    // -------------------------
    //  BASIC VALIDATION
    // -------------------------
    if (!body || typeof body !== "string" || body.trim().length === 0) {
      return NextResponse.json(
        { error: "Memory text (body) is required." },
        { status: 400 }
      );
    }

    if (typeof tileIndex !== "number") {
      return NextResponse.json(
        { error: "A specific tile must be selected to publish." },
        { status: 400 }
      );
    }

    const maxTiles = MAX_TILES_BY_WALL[wallSlug] ?? MAX_TILES_BY_WALL["m"];
    if (tileIndex < 0 || tileIndex >= maxTiles) {
      return NextResponse.json(
        { error: "Invalid tile index for this wall." },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // TEXT MODERATION CHECK
    // -----------------------------------------
    const textToCheck = `${title || ""}\n${body}\n${authorName || ""}`;
    const textIssue = await moderateText(textToCheck);

    if (textIssue) {
      return NextResponse.json({ error: textIssue }, { status: 400 });
    }

    // -----------------------------------------
    // IMAGE MODERATION (currently non-blocking)
    // -----------------------------------------
    if (imageData) {
      const imgIssue = await moderateImage(imageData);
      if (imgIssue) {
        return NextResponse.json({ error: imgIssue }, { status: 400 });
      }
    }

    // -----------------------------------------
    // DRAFT LOGIC
    // - If tile already has a *published* memory -> block edits
    // - If tile has an unpublished draft -> update it
    // - Otherwise create a new draft
    // -----------------------------------------
    const existing = await prisma.memory.findUnique({
      where: {
        wallSlug_tileIndex: { wallSlug, tileIndex },
      },
    });

    if (existing && existing.published) {
      return NextResponse.json(
        { error: "This tile has already been claimed and published." },
        { status: 409 }
      );
    }

    const data = {
      wallSlug,
      tileIndex,
      title: title?.trim() || null,
      body: body.trim(),
      authorName: authorName?.trim() || null,
      accentColor: accentColor || "none",
      imageUrl: imageUrl || null,
      imageData: imageData || null,
      // Draft status: payment/webhook will flip these to true
      paid: existing?.paid ?? false,
      published: existing?.published ?? false,
    };

    const memory = existing
      ? await prisma.memory.update({
          where: { wallSlug_tileIndex: { wallSlug, tileIndex } },
          data,
        })
      : await prisma.memory.create({ data });

    return NextResponse.json({ memory }, { status: 201 });
  } catch (err) {
    console.error("Error in POST /api/memories:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ===================================================================
//  GET — FETCH PUBLISHED MEMORIES FOR A WALL
//  (Drafts stay hidden until payment succeeds.)
// ===================================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallSlug = normaliseWallSlug(searchParams.get("wallSlug"));

    const memories = await prisma.memory.findMany({
      where: { wallSlug, published: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ memories }, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/memories:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
