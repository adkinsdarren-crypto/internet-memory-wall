// app/og/[id]/route.tsx
import { ImageResponse } from "next/og";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // Prisma cannot run on "edge"

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  // Get tile number from URL
  const { id } = await context.params;
  const tileNumber = Number(id) || 0;

  // DB tile index is zero-based
  const tileIndex = tileNumber > 0 ? tileNumber - 1 : 0;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  let memoryTitle: string | null = null;
  let imageSrc: string | null = null;

  try {
    const memory = await prisma.memory.findFirst({
      where: {
        wallSlug: "m",
        tileIndex,
      },
    });

    if (memory?.title) {
      memoryTitle = memory.title;
    }

    // 1) Prefer imageUrl if present
    if (memory?.imageUrl) {
      const raw = String(memory.imageUrl).trim();
      if (raw.startsWith("http")) {
        imageSrc = raw;
      } else {
        imageSrc = new URL(raw, baseUrl).toString();
      }
    }
    // 2) Otherwise fall back to imageData (may be URL or base64)
    else if (memory?.imageData) {
      const raw = String(memory.imageData).trim();

      if (raw.startsWith("http")) {
        imageSrc = raw;
      } else if (raw.startsWith("data:image")) {
        imageSrc = raw;
      } else if (/^[A-Za-z0-9+/=]+$/.test(raw)) {
        imageSrc = `data:image/png;base64,${raw}`;
      }
    }
  } catch (e) {
    console.error("OG fetch error:", e);
  }

  // Title: use real title if present, otherwise fallback
  let title = `Memory #${tileNumber}`;
  if (memoryTitle && memoryTitle.trim().length > 0) {
    title = memoryTitle.trim();
  }

  // Clamp title length so very long titles don't break layout
  const maxTitleLength = 90;
  const displayTitle =
    title.length > maxTitleLength
      ? title.slice(0, maxTitleLength - 1) + "…"
      : title;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at top, #020617 0, #000000 60%)",
          color: "#f9fafb",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {/* Card container */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            width: "90%",
            height: "68%",
            borderRadius: 28,
            padding: 28,
            boxSizing: "border-box",
            border: "1px solid rgba(148, 163, 184, 0.5)",
            background:
              "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(15,23,42,0.9))",
            gap: 24,
            boxShadow: "0 12px 40px rgba(0,0,0,0.45)", // drop shadow
          }}
        >
          {/* LEFT: image preview */}
          <div
            style={{
              display: "flex",
              flex: 1.05,
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.45)", // inner shadow
              background:
                "radial-gradient(circle at top, #0f172a 0, #020617 60%)",
              alignItems: "center",
              justifyContent: "center",
              padding: 8,
            }}
          >
            {imageSrc ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Actual Image */}
                <img
                  src={imageSrc}
                  alt="Memory image"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    borderRadius: 20,
                  }}
                />

                {/* Soft vignette overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: 20,
                    background:
                      "radial-gradient(circle at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.3) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "#9ca3af",
                  padding: 16,
                  textAlign: "center",
                  opacity: 0.8,
                }}
              >
                Your memory image will appear here.
              </div>
            )}
          </div>

          {/* RIGHT: text + branding */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                }}
              >
                Internet Memory Wall
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 16,
                  color: "#9ca3af",
                }}
              >
                Wall&nbsp;<strong style={{ marginLeft: 4 }}>M</strong>
              </div>
            </div>

            {/* Middle: big title + tagline */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 46,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  marginBottom: 10,
                }}
              >
                {displayTitle}
              </div>

              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  color: "#e5e7eb",
                  opacity: 0.9,
                }}
              >
                A saved moment on the global memory wall of one million
                tiles.
              </div>
            </div>

            {/* Bottom row: tile + logo + URL */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              {/* Left: tile info */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontSize: 16,
                    color: "#9ca3af",
                    marginBottom: 2,
                  }}
                >
                  Tile
                </div>
                <div
                  style={{
                    display: "flex",
                    fontSize: 34,
                    fontWeight: 700,
                    color: "#38bdf8",
                  }}
                >
                  #{tileNumber}
                </div>
              </div>

              {/* Right: mini logo + URL */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    width: 100,
                    justifyContent: "flex-end",
                  }}
                >
                  {Array.from({ length: 9 }).map((_, i) => {
                    const pattern = [0, 1, 2, 3, 4, 5, 7, 8];
                    const active = pattern.includes(i);
                    return (
                      <div
                        key={i}
                        style={{
                          width: 28,
                          height: 28,
                          marginLeft: 2,
                          marginBottom: 2,
                          borderRadius: 6,
                          background: active
                            ? "linear-gradient(135deg, #38bdf8, #6366f1)"
                            : "rgba(15,23,42,0.85)",
                        }}
                      />
                    );
                  })}
                </div>

                <div
                  style={{
                    display: "flex",
                    fontSize: 18,
                    color: "#9ca3af",
                  }}
                >
                  internetmemorywall.com/m/{tileNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
