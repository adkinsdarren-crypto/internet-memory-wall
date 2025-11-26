"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import AddMemorySection from "./components/AddMemorySection";
import TileGrid from "./components/TileGrid";

type WallSlug = "m" | "m2" | "m3";

const WALL_TOTAL_TILES: Record<WallSlug, number> = {
  m: 1_000_000,
  m2: 10_000_000,
  m3: 100_000_000,
};

const TILES_PER_PAGE = 2000;

function wallDisplayName(wall: WallSlug) {
  if (wall === "m2") return "M²";
  if (wall === "m3") return "M³";
  return "M";
}

export default function HomePage() {
  const [currentWall, setCurrentWall] = React.useState<WallSlug>("m");

  const [filledCount, setFilledCount] = React.useState(0);
  const [gridTotalTiles, setGridTotalTiles] = React.useState(
    WALL_TOTAL_TILES["m"]
  );

  const [isMComplete, setIsMComplete] = React.useState(false);

  const effectiveTotalTiles =
    gridTotalTiles || WALL_TOTAL_TILES[currentWall] || 1;

  const completionPct = Math.min(
    100,
    (filledCount / effectiveTotalTiles) * 100
  );

  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageInput, setPageInput] = React.useState("");

  const totalPages = Math.max(
    1,
    Math.ceil(effectiveTotalTiles / TILES_PER_PAGE)
  );

  const startTile =
    (currentPage - 1) * TILES_PER_PAGE + 1 > effectiveTotalTiles
      ? effectiveTotalTiles
      : (currentPage - 1) * TILES_PER_PAGE + 1;
  const endTile = Math.min(currentPage * TILES_PER_PAGE, effectiveTotalTiles);

  function goToPage(page: number) {
    if (!Number.isFinite(page)) return;
    const clamped = Math.min(Math.max(1, Math.floor(page)), totalPages);
    setCurrentPage(clamped);
  }

  function handleGoClick() {
    if (!pageInput) return;
    const num = Number(pageInput);
    if (Number.isNaN(num)) return;
    goToPage(num);
  }

  function handleWallChange(wall: WallSlug) {
    setCurrentWall(wall);
    setCurrentPage(1);
    // ensure stats & pagination use the correct size for the new wall
    setGridTotalTiles(WALL_TOTAL_TILES[wall]);
  }

  // Can we claim tiles on the *currently selected* wall?
  const canClaimOnCurrentWall =
    currentWall === "m" || (isMComplete && currentWall !== "m2");

  // 👇 Form is only allowed to write to unlocked walls
  // Before M is complete → always M
  // After M is complete → whichever wall is selected
  const formWallSlug: WallSlug = canClaimOnCurrentWall ? currentWall : "m";
  const formTotalTiles = WALL_TOTAL_TILES[formWallSlug];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* HERO */}
      <motion.section
        className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_#22d3ee33,_transparent_60%),radial-gradient(circle_at_bottom,_#0f172a,_transparent_60%)]" />

        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-16 md:flex-row md:items-center md:gap-14 md:px-6 lg:px-8">
          {/* Left side */}
          <div className="max-w-xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
              Internet Memory Wall
            </div>

            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-[3.2rem]">
              Shaped by millions.
              <br />
              <span className="text-sky-400">Shared by you.</span>
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-slate-300">
              Claim one tile on a wall of millions. Add a memory and become part
              of a living mosaic of stories from around the world.
            </p>

            {/* Stats */}
            <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs text-slate-200">
              <span className="rounded-full bg-slate-800/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                {filledCount.toLocaleString()} /{" "}
                {effectiveTotalTiles.toLocaleString()} tiles claimed on{" "}
                {wallDisplayName(currentWall)}
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-500/70 sm:inline-block" />
              <span className="text-[11px] text-slate-400">
                Each tile is <span className="font-semibold">$1.00 USD</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="#wall"
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-400/40 transition hover:bg-sky-300"
              >
                View the wall
              </Link>

              <Link
                href="#add-memory"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400 hover:text-sky-300"
              >
                Add a memory
              </Link>

              {/* Wall selector */}
              <div className="ml-2 flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-2 py-1 text-xs">
                {(["m", "m2", "m3"] as WallSlug[]).map((wall) => {
                  const active = wall === currentWall;
                  const isLockedWall =
                    (wall === "m2" || wall === "m3") && !isMComplete;

                  return (
                    <button
                      key={wall}
                      onClick={() => handleWallChange(wall)}
                      title={
                        isLockedWall
                          ? "Locked — tiles will unlock once M is complete"
                          : `View ${wallDisplayName(wall)}`
                      }
                      className={[
                        "rounded-full px-3 py-1 transition",
                        active
                          ? "bg-sky-500/90 text-slate-950 shadow-sm shadow-sky-500/60"
                          : isLockedWall
                          ? "text-slate-500 border border-dashed border-slate-700 hover:text-slate-300"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/80",
                      ].join(" ")}
                    >
                      {wallDisplayName(wall)}
                      {isLockedWall && (
                        <span className="ml-1 text-[9px] uppercase tracking-[0.18em] text-amber-300/90">
                          Locked
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right preview */}
          <div className="pointer-events-none hidden flex-1 justify-end md:flex">
            <div className="relative h-64 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-[0_0_40px_rgba(56,189,248,0.25)]">
              <div className="grid h-full w-full grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full rounded-md bg-slate-800/80 ${
                      i % 13 === 0
                        ? "bg-gradient-to-br from-sky-400 to-emerald-400"
                        : i % 11 === 0
                        ? "bg-sky-500/70"
                        : ""
                    }`}
                  />
                ))}
              </div>
              <div className="pointer-events-auto absolute inset-x-4 bottom-3 flex items-center justify-between rounded-2xl bg-slate-950/80 px-3 py-2 text-[11px] text-slate-400 backdrop-blur">
                <span>
                  {filledCount.toLocaleString()} memories on{" "}
                  {wallDisplayName(currentWall)}
                </span>
                <span>{completionPct.toFixed(2)}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* HOW IT WORKS */}
      <section className="border-b border-slate-800 bg-slate-950/80">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              How the wall works
            </h2>
            <p className="mt-1 text-sm text-slate-400 md:text-base">
              The Internet Memory Wall is a curated grid of{" "}
              {WALL_TOTAL_TILES["m"].toLocaleString()} tiles — a huge but finite
              space where anyone can preserve a moment forever.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {/* Step 1 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step 1
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">
                Choose a tile
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Pick any empty tile in the million-tile grid. Once you claim it,
                that space is yours.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step 2
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">
                Add your memory
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Write something meaningful, add an optional image or meme, and
                choose a colour accent or alias.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step 3
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">
                Make it permanent
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Once published, your tile becomes part of the wall. The point is
                to remember, not to endlessly edit.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Step 4
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">
                Watch the wall fill up
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                When all {WALL_TOTAL_TILES["m"].toLocaleString()} tiles are
                filled, this version of the wall is sealed. Then the next era
                begins: M².
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WALL + ADD MEMORY SECTION */}
      <section id="wall" className="bg-slate-950/95 pb-14 pt-6 md:pt-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:px-6 lg:px-8">
          {/* Pagination controls */}
          <div className="mt-1 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-2.5 text-xs text-slate-200 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>
                Viewing tiles{" "}
                <span className="font-semibold">
                  {startTile.toLocaleString()}–
                  {endTile.toLocaleString()}
                </span>
              </p>
              <p className="text-slate-400">
                Page{" "}
                <span className="font-semibold">{currentPage}</span> /{" "}
                <span>{totalPages.toLocaleString()}</span> ·{" "}
                {TILES_PER_PAGE.toLocaleString()} tiles / page
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600 hover:border-sky-400 hover:text-sky-300"
              >
                ‹ Prev
              </button>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-[11px] font-medium text-slate-200 transition disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-600 hover:border-sky-400 hover:text-sky-300"
              >
                Next ›
              </button>

              <div className="ml-1 flex items-center gap-1 rounded-full border border-slate-700 bg-slate-950/70 px-2 py-1">
                <span className="text-[11px] text-slate-400">Go to page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleGoClick();
                  }}
                  className="h-7 w-16 rounded-full border border-slate-700 bg-slate-900 px-2 text-[11px] text-slate-100 outline-none focus:border-sky-400"
                />
                <button
                  onClick={handleGoClick}
                  className="rounded-full bg-sky-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-sky-400"
                >
                  Go
                </button>
              </div>
            </div>
          </div>

          {/* Tile grid */}
          <TileGrid
            wallSlug={currentWall}
            totalTiles={effectiveTotalTiles}
            page={currentPage}
            tilesPerPage={TILES_PER_PAGE}
            canClaimTiles={canClaimOnCurrentWall}
            onStatsChange={({ filledCount, totalTiles }) => {
              setFilledCount(filledCount);
              if (totalTiles) setGridTotalTiles(totalTiles);

              if (
                currentWall === "m" &&
                totalTiles &&
                filledCount >= totalTiles
              ) {
                setIsMComplete((prev) => prev || true);
              }
            }}
          />

          {/* Add memory section */}
          <AddMemorySection
            wallSlug={formWallSlug}
            totalTiles={formTotalTiles}
            priceUsd={1}
          />
        </div>
      </section>
    </main>
  );
}
