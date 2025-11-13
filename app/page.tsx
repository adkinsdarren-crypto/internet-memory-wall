export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: "3rem 1.5rem",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        background:
          "radial-gradient(circle at top, #e9d5ff 0, #faf5ff 40%, #ffffff 100%)",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2.8rem",
            marginBottom: "1rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
          }}
        >
          Internet Memory Wall
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#4b5563",
            marginBottom: "2rem",
          }}
        >
          A permanent collage of our favourite moments from around the internet.
          One tile, one memory, one tiny piece of web history.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          <button
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "999px",
              border: "none",
              backgroundColor: "#111827",
              color: "#ffffff",
              fontSize: "0.95rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Get started (coming soon)
          </button>

          <button
            style={{
              padding: "0.75rem 1.75rem",
              borderRadius: "999px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#4b5563",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            View the wall (mock)
          </button>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "1.25rem",
            textAlign: "left",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              Claim a tile
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              In the future, you&apos;ll be able to buy a small square on the
              wall for a one-time fee.
            </p>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              Add your memory
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Upload an image and a short story about something you loved on the
              internet.
            </p>
          </div>

          <div
            style={{
              padding: "1rem",
              borderRadius: "1rem",
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}
            >
              Lives online
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              The wall will be hosted long-term so your tile becomes a tiny
              piece of shared web history.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}