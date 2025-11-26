"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// ✅ Use the shared components from app/components
import AddMemorySection from "../components/AddMemorySection";
import TileGrid from "../components/TileGrid";

type WallStatus = {
  wallSlug: string;
  totalTiles: number;
  filled: number;
  isFull: boolean;
};

export default function HomePage() {
  const [mStatus, setMStatus] = useState<WallStatus | null>(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/wall-status?wallSlug=m");
        if (!res.ok) return;
        const data = await res.json();
        setMStatus(data);
      } catch (err) {
        console.error("Error fetching wall status:", err);
      }
    }

    fetchStatus();
  }, []);

  const isMFull = mStatus?.isFull === true;

  // We treat M as 1,000,000 tiles here
  const TOTAL_TILES_M = 1_000_000;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Hero */}
      <motion.section
        className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_#22d3ee33,_transparent_60%),radial-gradient(circle_at_bottom,_#1d4ed833,_transparent_60%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-24 sm:px-6 lg:flex-row lg:items-center lg:gap-16 lg:px-8 lg:pt-28 lg:pb-24">
          {/* Left: Text */}
          <div className="flex-1 space-y-6">
            {/* Status pill */}
            <motion.div
              className="inline-flex items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-slate-300 shadow-inner shadow-slate-900/80 backdrop-blur-md"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <span className="relative inline-flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400/60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </span>
              <span>M · The Internet Memory Wall</span>
              <span className="text-slate-500">•</span>
              <span>1,000,000 tiles</span>
              <span className="text-slate-500">•</span>
              <span>{isMFull ? "Sealed" : "First Edition"}</span>
            </motion.div>

            <motion.h1
              className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              A million moments.
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-400 bg-clip-text text-transparent">
                One collective memory.
              </span>
            </motion.h1>

            <motion.p
              className="max-w-xl text-balance text-slate-300"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
            >
              A global mosaic built from 1,000,000 unique tiles — each one
              holding a memory, a story, a fragment of a life lived. This is
              where the internet comes to remember.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-3 pt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38 }}
            >
              {!isMFull && (
                <Link
                  href="#add-memory"
                  className="inline-flex items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-400/20 px-5 py-2.5 text-sm font-medium text-cyan-100 shadow-sm shadow-cyan-500/30 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-cyan-400/30"
                >
                  Add Your Memory
                </Link>
              )}

              <Link
                href="#wall"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/60 px-5 py-2.5 text-sm font-medium text-slate-100 shadow-sm shadow-slate-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-900"
              >
                Explore the Wall
              </Link>
            </motion.div>

            <motion.p
              className="text-xs text-slate-400"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.48 }}
            >
              M stands for Memory. This first wall spans one million tiles. From
              here, future expansions become M², M³, and beyond.
            </motion.p>
          </div>

          {/* Right: M Tile Logo / Preview */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-6">
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-cyan-500/10 backdrop-blur">
                <div className="mx-auto grid aspect-square max-w-[260px] grid-cols-5 gap-1.5">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const row = Math.floor(i / 5);
                    const col = i % 5;

                    const isM =
                      col === 0 ||
                      col === 4 ||
                      (row === 1 && (col === 1 || col === 3)) ||
                      (row === 2 && col === 2);

                    return (
                      <div
                        key={i}
                        className={`h-10 w-10 rounded-md transition ${
                          isM
                            ? "bg-gradient-to-br from-cyan-300 via-sky-400 to-blue-500 shadow-md shadow-cyan-500/40"
                            : "bg-slate-900/60 border border-slate-800"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="mt-5 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-100">
                      M – The First Wall
                    </p>
                    <p className="text-slate-400">
                      {mStatus
                        ? `${mStatus.filled.toLocaleString()} / ${mStatus.totalTiles.toLocaleString()} tiles filled`
                        : "Loading…"}{" "}
                      {isMFull ? "• Sealed" : "• Live"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300">
                    M₁
                  </span>
                </div>
              </div>

              <p className="max-w-sm text-center text-xs text-slate-400">
                The wall begins with 1,000,000 tiles. Once every tile is claimed
                by a memory, M is sealed — and the next chapter, M², begins.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-b border-slate-800 bg-slate-950"
      >
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-10 space-y-3 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              How the wall works
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-slate-300">
              The Internet Memory Wall is a curated grid of 1,000,000 tiles — a
              huge but finite space where anyone can preserve a moment forever.
              Once all 1,000,000 tiles are filled, this version of the wall
              becomes permanent.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-4 md:gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm shadow-sm shadow-slate-900/60">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 1
              </p>
              <h3 className="mb-2 text-base font-semibold">Choose a tile</h3>
              <p className="text-slate-300">
                Pick any empty tile in the million-tile grid. Once you claim it,
                that space is yours.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm shadow-sm shadow-slate-900/60">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 2
              </p>
              <h3 className="mb-2 text-base font-semibold">
                Add your memory
              </h3>
              <p className="text-slate-300">
                Write something meaningful, add an optional image or meme, and
                choose a colour accent or alias.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm shadow-sm shadow-slate-900/60">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 3
              </p>
              <h3 className="mb-2 text-base font-semibold">
                Make it permanent
              </h3>
              <p className="text-slate-300">
                Once you publish your tile, it becomes a permanent part of the
                wall. The point is to remember, not to endlessly edit.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm shadow-sm shadow-slate-900/60">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Step 4
              </p>
              <h3 className="mb-2 text-base font-semibold">
                Watch the wall fill up
              </h3>
              <p className="text-slate-300">
                When all 1,000,000 tiles are full, M is sealed forever. Then the
                next era begins: M².
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wall section */}
      <section
        id="wall"
        className="border-b border-slate-800 bg-slate-950/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                The Wall
              </h2>
              <p className="max-w-xl text-sm text-slate-300">
                Every tile holds a memory. As the grid fills, it becomes a map
                of what it felt like to be alive during this moment of the
                internet.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              This is the first edition wall — later walls like M² and M³ build
              on what starts here.
            </p>
          </div>

          {/* ✅ Use shared TileGrid with 1,000,000 total tiles */}
          <TileGrid wallSlug="m" totalTiles={TOTAL_TILES_M} />
        </div>
      </section>

      {/* Add Memory section */}
      {isMFull ? (
        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              M is sealed.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
              All 1,000,000 tiles on the first Internet Memory Wall have been
              claimed. This wall is now a fixed digital time capsule.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
              New memories can be added to{" "}
              <span className="font-semibold text-cyan-300">M²</span>, the
              second wall with 10,000,000 tiles.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/m2#add-memory"
                className="inline-flex items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-400/20 px-6 py-2.5 text-sm font-medium text-cyan-100 shadow-sm shadow-cyan-500/40 backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-cyan-400/30"
              >
                Add a Memory to M²
              </Link>
              <Link
                href="/m2"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 bg-slate-900/60 px-6 py-2.5 text-sm font-medium text-slate-100 shadow-sm shadow-slate-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-900"
              >
                Explore the M² Wall
              </Link>
            </div>
          </div>
        </section>
      ) : (
        // ✅ Shared AddMemorySection (same as homepage)
        <AddMemorySection
          wallSlug="m"
          totalTiles={TOTAL_TILES_M}
          priceUsd={1}
        />
      )}

      {/* About / Philosophy snippet */}
      <section className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Why a memory wall?
          </h2>
          <div className="mt-4 space-y-4 text-sm text-slate-300">
            <p>
              The internet moves fast. Too fast. Moments appear and disappear in
              a scroll. We forget more than we realise.
            </p>
            <p>
              The Internet Memory Wall was created to slow things down — to
              carve out a space where memories are given weight, where stories
              have permanence, and where a million small moments can build
              something bigger than any of us.
            </p>
            <p>
              This is a digital time capsule for the world. A place to remember
              that behind every screen is a life full of meaning.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Internet Memory Wall — a global project built one tile at a time.</p>
          <p className="text-[11px]">
            M stands for Memory. And now, for a million moments. The story gets
            bigger from here.
          </p>
        </div>
      </footer>
    </main>
  );
}
