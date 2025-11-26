import { prisma } from "@/lib/prisma";

type ParamsPromise = {
  params: Promise<{ tileNumber: string }>;
};

// -----------------------------
// METADATA
// -----------------------------
export async function generateMetadata({ params }: ParamsPromise) {
  const { tileNumber } = await params;
  const publicTileNumber = Number(tileNumber) || 0;
  const tileIndex = publicTileNumber > 0 ? publicTileNumber - 1 : 0;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const ogImageUrl = `${baseUrl}/og/${publicTileNumber}`;

  const title = `Memory #${publicTileNumber} · Internet Memory Wall`;
  const description = `Tile #${publicTileNumber} on the Internet Memory Wall.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/m/${publicTileNumber}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// -----------------------------
// PAGE COMPONENT
// -----------------------------
export default async function MemoryPage({ params }: ParamsPromise) {
  const { tileNumber } = await params;
  const publicTileNumber = Number(tileNumber) || 0;
  const tileIndex = publicTileNumber > 0 ? publicTileNumber - 1 : 0;

  let memory: any = null;
  let error: string | null = null;

  try {
    memory = await prisma.memory.findFirst({
      where: {
        wallSlug: "m",
        tileIndex, // 0-based in DB
      },
    });
  } catch (e) {
    error = "There was an error loading this memory.";
    console.error(e);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#020617",
        color: "#f9fafb",
        padding: "40px",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>
        Memory page – tile #{publicTileNumber}
      </h1>

      {error && (
        <p style={{ color: "tomato", marginBottom: 24 }}>{error}</p>
      )}

      {!error && !memory && (
        <p style={{ fontSize: 18 }}>
          No memory found for tile #{publicTileNumber} on wall{" "}
          <code>m</code>.
        </p>
      )}

      {memory && (
        <>
          <p style={{ fontSize: 20, marginBottom: 16 }}>
            <strong>Title:</strong> {memory.title ?? "(no title)"}
          </p>

          {memory.imageUrl && (
            <img
              src={memory.imageUrl}
              alt="Memory"
              style={{
                width: 400,
                maxWidth: "100%",
                borderRadius: 12,
                marginBottom: 24,
              }}
            />
          )}

          <p style={{ fontSize: 16, opacity: 0.8 }}>
            This is tile #{publicTileNumber} on the Internet Memory Wall
            (wall slug: <code>m</code>, tileIndex {tileIndex} in the
            database).
          </p>
        </>
      )}
    </div>
  );
}
