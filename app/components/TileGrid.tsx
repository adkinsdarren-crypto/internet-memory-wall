"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type TileState = "empty" | "filled";

type Memory = {
  id: number;
  title: string | null;
  body: string;
  authorName: string | null;
  accentColor: string;
  createdAt: string;
  wallSlug: string;
  tileIndex: number; // 0-based in DB
  imageData?: string | null;
  imageUrl?: string | null;
  paid?: boolean;
};

type TileGridProps = {
  wallSlug: string;
  totalTiles: number;

  /** New pagination props (used by page.tsx) */
  page?: number; // 1-based current page
  tilesPerPage?: number; // tiles per page

  /** Legacy props (still supported / optional) */
  tileOffset?: number; // 0-based global starting tile index for this page
  pageSize?: number; // how many tiles on this page (we'll cap at MAX_VISIBLE_TILES)

  /** Whether tiles on this wall can currently be claimed */
  canClaimTiles?: boolean;

  onStatsChange?: (stats: {
    filledCount: number;
    totalTiles: number;
  }) => void;
};

// Safe ceiling for DOM nodes per page
const MAX_VISIBLE_TILES = 2_000;

function wallLabel(wallSlug: string): string {
  if (wallSlug === "m2") return "M² · The Second Wall";
  if (wallSlug === "m3") return "M³ · The Third Wall";
  return "M · The First Wall";
}

export default function TileGrid({
  wallSlug,
  totalTiles,
  page,
  tilesPerPage,
  tileOffset,
  pageSize,
  canClaimTiles = true,
  onStatsChange,
}: TileGridProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const fetchMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/memories?wallSlug=${encodeURIComponent(wallSlug)}`
      );

      if (!res.ok) {
        throw new Error("Failed to load memories");
      }

      const data = await res.json();
      const list: Memory[] = Array.isArray(data.memories) ? data.memories : [];
      setMemories(list);
    } catch (error) {
      console.error("Error fetching memories for grid:", error);
    } finally {
      setIsLoading(false);
    }
  }, [wallSlug]);

  useEffect(() => {
    fetchMemories();
  }, [fetchMemories]);

  useEffect(() => {
    function handleMemorySaved() {
      fetchMemories();
    }

    if (typeof window !== "undefined") {
      window.addEventListener("memory-saved", handleMemorySaved);
      return () => {
        window.removeEventListener("memory-saved", handleMemorySaved);
      };
    }

    return undefined;
  }, [fetchMemories]);

  const filledCount = memories.length;

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({ filledCount, totalTiles });
    }
  }, [onStatsChange, filledCount, totalTiles]);

  function getTileState(globalIndex: number): TileState {
    const hasMemory = memories.some((m) => m.tileIndex === globalIndex);
    return hasMemory ? "filled" : "empty";
  }

  function getMemoryForTile(globalIndex: number): Memory | undefined {
    return memories.find((m) => m.tileIndex === globalIndex);
  }

  function accentClasses(accent: string | null | undefined): string {
    switch (accent) {
      case "blue":
        return "from-cyan-300/80 via-sky-400/90 to-blue-500/90";
      case "orange":
        return "from-amber-300/80 via-orange-400/90 to-red-500/90";
      case "green":
        return "from-emerald-300/80 via-lime-400/90 to-green-500/90";
      case "lavender":
        return "from-violet-300/80 via-purple-400/90 to-fuchsia-500/90";
      case "gold":
        return "from-amber-200/80 via-yellow-300/90 to-amber-500/90";
      case "none":
      default:
        return "from-cyan-300/80 via-sky-400/90 to-blue-500/90";
    }
  }

  function handleTileClick(globalIndex: number) {
    const state = getTileState(globalIndex);

    if (state === "empty") {
      // If wall is locked, do nothing on empty tiles
      if (!canClaimTiles) {
        return;
      }

      if (typeof window !== "undefined") {
        const tileNumber = globalIndex + 1; // 1-based for display

        // 🔔 Fire the selection event with multiple helpful fields
        window.dispatchEvent(
          new CustomEvent("open-add-memory", {
            detail: {
              tileIndex: globalIndex, // 0-based index
              tileNumber, // 1-based index, in case the form uses this
              wallSlug,
            },
          })
        );

        const section = document.getElementById("add-memory");
        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
      return;
    }

    const memory = getMemoryForTile(globalIndex);

    if (!memory) {
      alert("This tile is marked as filled but no memory was found.");
      return;
    }

    setSelectedMemory(memory);
  }

  function closeModal() {
    setSelectedMemory(null);
  }

  const progressPercent = Math.min(
    100,
    totalTiles > 0 ? Math.round((filledCount / totalTiles) * 100) : 0
  );

  // ---- PAGINATION MATH (page + tilesPerPage or legacy tileOffset/pageSize) ----

  const effectiveTotalTiles = Math.max(totalTiles, 0);

  // Base page size (priority: tilesPerPage -> pageSize -> default)
  const pageSizeForMap = Math.min(
    tilesPerPage ?? pageSize ?? MAX_VISIBLE_TILES,
    MAX_VISIBLE_TILES
  );

  // Current page (1-based)
  const currentPage =
    page && page > 0
      ? page
      : tileOffset && tileOffset > 0
      ? Math.floor(tileOffset / pageSizeForMap) + 1
      : 1;

  // 0-based global starting index for this page
  const computedTileOffset = Math.max((currentPage - 1) * pageSizeForMap, 0);

  // How many tiles to render on this page
  const remainingTiles = Math.max(effectiveTotalTiles - computedTileOffset, 0);
  const tilesInThisPage = Math.min(
    pageSizeForMap,
    remainingTiles,
    MAX_VISIBLE_TILES
  );

  const totalPagesForMap = Math.max(
    1,
    Math.ceil(effectiveTotalTiles / pageSizeForMap)
  );

  // Mini-map: how many memories fall in each page
  const pageFillCounts = useMemo(() => {
    const counts = new Array(totalPagesForMap).fill(0);
    for (const m of memories) {
      if (m.tileIndex >= 0 && m.tileIndex < effectiveTotalTiles) {
        const p = Math.floor(m.tileIndex / pageSizeForMap);
        if (p >= 0 && p < totalPagesForMap) {
          counts[p] += 1;
        }
      }
    }
    return counts;
  }, [memories, totalPagesForMap, effectiveTotalTiles, pageSizeForMap]);

  return (
    <>
      <div className="space-y-4">
        {/* Header + progress */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              {wallLabel(wallSlug)}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-medium text-slate-100">
                {filledCount.toLocaleString()} / {totalTiles.toLocaleString()}
              </span>
              <span>tiles claimed</span>
              <span className="h-1 w-1 rounded-full bg-slate-500" />
              <span className="text-[11px] text-slate-500">
                {isLoading ? "Syncing memories…" : "Live wall state"}
              </span>
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-xs space-y-1"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Completion</span>
              <span className="font-medium text-slate-200">
                {progressPercent}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-900">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(
                    progressPercent,
                    filledCount > 0 ? 4 : 0
                  )}%`,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        </div>

        {/* Mini-map strip */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Wall coverage</span>
            <span>
              {totalPagesForMap.toLocaleString()} pages ·{" "}
              {filledCount.toLocaleString()} tiles placed
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-900">
            {pageFillCounts.map((count, idx) => {
              const fullness = Math.min(1, count / pageSizeForMap);
              // 0 tiles = very faint, full page = bright
              const opacity = fullness === 0 ? 0.18 : 0.25 + fullness * 0.75;

              return (
                <div
                  key={idx}
                  className="flex-1"
                  style={{
                    background: `linear-gradient(to top, rgba(45,212,191,${opacity}), rgba(56,189,248,${opacity}))`,
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/90 shadow-[0_18px_45px_rgba(15,23,42,0.9)] grid-shimmer">
          <div
            className="
              grid
              gap-[1px]
              bg-slate-900
              p-[1px]
              grid-cols-5
              xs:grid-cols-8
              sm:grid-cols-12
              md:grid-cols-20
              lg:grid-cols-25
            "
          >
            {Array.from({ length: tilesInThisPage }).map((_, index) => {
              const globalIndex = computedTileOffset + index;

              const memory = getMemoryForTile(globalIndex);
              const isFilled = !!memory;
              const state: TileState = isFilled ? "filled" : "empty";

              const imageSrc = memory?.imageUrl || memory?.imageData || null;
              const delay = state === "filled" ? (index % 25) * 0.01 : 0;

              const isLockedEmpty = !canClaimTiles && state === "empty";

              return (
                <motion.button
                  key={globalIndex}
                  type="button"
                  onClick={() => handleTileClick(globalIndex)}
                  disabled={isLockedEmpty}
                  className={`
                    group
                    relative
                    aspect-square
                    transform-gpu
                    bg-slate-950
                    transition
                    focus:outline-none
                    focus-visible:z-10
                    focus-visible:ring-2
                    focus-visible:ring-cyan-400
                    focus-visible:ring-offset-1
                    focus-visible:ring-offset-slate-950
                    tile-glow-hover
                    hover:z-[1]
                    ${
                      isLockedEmpty
                        ? "cursor-not-allowed opacity-60 hover:scale-100"
                        : ""
                    }
                  `}
                  title={
                    isLockedEmpty
                      ? "This wall is locked — tiles unlock once M is complete"
                      : isFilled
                      ? memory?.title
                        ? memory.title
                        : memory?.body
                        ? memory.body.slice(0, 80)
                        : `Tile #${(memory?.tileIndex ?? globalIndex) + 1}`
                      : `Empty tile #${globalIndex + 1}`
                  }
                  initial={{
                    opacity: state === "filled" ? 0 : 1,
                    scale: state === "filled" ? 0.96 : 1,
                  }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay,
                  }}
                  whileHover={
                    !isLockedEmpty
                      ? {
                          scale: state === "filled" ? 1.03 : 1.02,
                          transition: {
                            duration: 0.08,
                            ease: "easeOut",
                          },
                        }
                      : undefined
                  }
                  whileTap={!isLockedEmpty ? { scale: 0.97 } : undefined}
                >
                  <div
                    className={`
                      relative
                      h-full
                      w-full
                      overflow-hidden
                      transition-transform
                      duration-75
                      ${
                        state === "filled"
                          ? "opacity-100"
                          : "border border-slate-800/80 group-hover:border-cyan-300/70 group-hover:bg-cyan-400/10"
                      }
                    `}
                  >
                    {state === "filled" && imageSrc ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageSrc}
                          alt={memory?.title || "Memory image"}
                          className="h-full w-full object-cover"
                        />
                        <div
                          className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${accentClasses(
                            memory?.accentColor
                          )} mix-blend-soft-light opacity-70`}
                        />
                      </>
                    ) : state === "filled" ? (
                      <div
                        className={`h-full w-full bg-gradient-to-br ${accentClasses(
                          memory?.accentColor
                        )}`}
                      />
                    ) : null}

                    {/* Tile index badge – only on empty tiles */}
                    {state === "empty" && (
                      <div className="pointer-events-none absolute left-1 top-1 rounded-full bg-slate-950/70 px-1.5 py-[2px] text-[8px] font-medium text-slate-300 shadow-[0_0_0_1px_rgba(15,23,42,0.8)]">
                        #{globalIndex + 1}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Memory detail modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm sm:px-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key="modal"
              className="relative z-50 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950/95 text-sm text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.95)]"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {(() => {
                const modalImageSrc =
                  selectedMemory.imageUrl || selectedMemory.imageData || null;

                if (!modalImageSrc) return null;

                return (
                  <div className="border-b border-slate-800 bg-slate-900 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={modalImageSrc}
                      alt={selectedMemory.title || "Memory image"}
                      className="max-h-80 w-full object-contain"
                    />
                  </div>
                );
              })()}

              <div className="p-5 sm:p-7 lg:p-8">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                      Memory from {wallLabel(selectedMemory.wallSlug)}
                    </p>
                    <h3 className="text-base font-semibold sm:text-lg">
                      {selectedMemory.title || "Untitled memory"}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tile #{selectedMemory.tileIndex + 1} •{" "}
                      {selectedMemory.authorName || "Anonymous"} •{" "}
                      {new Date(selectedMemory.createdAt).toLocaleString()}
                      
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 transition hover:border-slate-500 hover:text-slate-200"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-slate-500">Share link:</span>
                  <Link
                    href={`/m/${selectedMemory.tileIndex + 1}`}
                    className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-[10px] text-slate-100 hover:border-cyan-400/80 hover:bg-slate-900/80"
                  >
                    /m/{selectedMemory.tileIndex + 1}
                  </Link>
                </div>

                <div className="space-y-4">
                  <p className="whitespace-pre-line text-sm text-slate-200">
                    {selectedMemory.body}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Accent:{" "}
                      <span className="font-medium text-slate-300">
                        {selectedMemory.accentColor || "none"}
                      </span>
                    </span>
                    <span>Part of {wallLabel(selectedMemory.wallSlug)}.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
