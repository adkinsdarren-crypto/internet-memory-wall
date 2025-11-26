"use client";

import React, { useCallback, useEffect, useState } from "react";


type Memory = {
  id: number;
  tileIndex: number;
  wallSlug: string;
};

type AddMemorySectionProps = {
  wallSlug: string; // "m", "m2", "m3"
  totalTiles: number;
  priceUsd?: number;
};

type AccentColor = "blue" | "orange" | "green" | "lavender" | "gold" | "none";

const MAX_RANDOM_TILES = 2000; // only pick random tiles from the first chunk

export default function AddMemorySection({
  wallSlug,
  totalTiles,
  priceUsd = 1,
}: AddMemorySectionProps) {
  const wall = "m";

  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(
    null
  );
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isRandomPicking, setIsRandomPicking] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [accentColor, setAccentColor] = useState<AccentColor>("blue");
  const [imageData, setImageData] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // 💡 Listen for tile clicks from the grid.
  // We no longer filter by wallSlug to avoid mismatch issues.
  useEffect(() => {
    function handleOpenAddMemory(e: Event) {
      const custom = e as CustomEvent<{
        tileIndex: number;
        wallSlug?: string;
      }>;

      if (
        !custom.detail ||
        typeof custom.detail.tileIndex !== "number"
      ) {
        return;
      }

      setSelectedTileIndex(custom.detail.tileIndex);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("open-add-memory", handleOpenAddMemory);
      return () => {
        window.removeEventListener("open-add-memory", handleOpenAddMemory);
      };
    }
  }, []); // no deps – attach once

  const wallLabelForForm =
    wallSlug === "m2" ? "M²" : wallSlug === "m3" ? "M³" : "M";

  const selectedLabel =
    selectedTileIndex !== null
      ? `Tile #${selectedTileIndex + 1} on ${wallLabelForForm}`
      : "No tile selected yet";

  // 🎲 Random empty tile (only in the first MAX_RANDOM_TILES for performance)
  const handleRandomTile = useCallback(async () => {
    try {
      setIsRandomPicking(true);

      const res = await fetch(
        `/api/memories?wallSlug=${encodeURIComponent(wallSlug)}`
      );
      if (!res.ok) {
        throw new Error("Failed to load wall state for random tile");
      }

      const data = await res.json();
      const list: Memory[] = Array.isArray(data.memories) ? data.memories : [];

      const filled = new Set(list.map((m) => m.tileIndex));

      const maxIndex = Math.min(totalTiles, MAX_RANDOM_TILES);
      const emptyIndices: number[] = [];
      for (let i = 0; i < maxIndex; i++) {
        if (!filled.has(i)) emptyIndices.push(i);
      }

      if (emptyIndices.length === 0) {
        alert("All visible tiles on this part of the wall have been claimed. 🧱");
        return;
      }

      const randomIndex =
        emptyIndices[Math.floor(Math.random() * emptyIndices.length)];

      setSelectedTileIndex(randomIndex);

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("random-tile-picked", {
            detail: { tileIndex: randomIndex, wallSlug },
          })
        );
      }
    } catch (error) {
      console.error("Error picking random tile", error);
      alert("Sorry, something went wrong picking a random tile.");
    } finally {
      setIsRandomPicking(false);
    }
  }, [wallSlug, totalTiles]);

  // 📷 Image upload with client-side compression
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageData(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      setImageData(null);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const result = readerEvent.target?.result;
      if (!result || typeof result !== "string") {
        alert("Could not read image file.");
        return;
      }

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 900;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          alert("Could not process image.");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              alert("Could not compress image.");
              return;
            }

            const compressedReader = new FileReader();
            compressedReader.onloadend = () => {
              const base64 = compressedReader.result;
              if (typeof base64 === "string") {
                setImageData(base64);
              }
            };
            compressedReader.readAsDataURL(blob);
          },
          "image/jpeg",
          0.7
        );
      };

      img.onerror = () => {
        alert("Could not load image.");
      };

      img.src = result;
    };

    reader.readAsDataURL(file);
  }

  // Save / update draft memory BEFORE checkout
  async function saveDraftMemory(): Promise<boolean> {
    if (selectedTileIndex === null) {
      alert("Please select a tile first.");
      return false;
    }

    if (!body.trim()) {
      alert("Please write something for your memory.");
      return false;
    }

    try {
      setIsSavingDraft(true);

      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallSlug,
          tileIndex: selectedTileIndex,
          title: title.trim() || null,
          body: body.trim(),
          authorName: authorName.trim() || null,
          accentColor,
          imageData,
          imageUrl: null,
          editToken: editToken || undefined,
        }),
      });

      if (!res.ok) {
        let message = "Failed to save your story before checkout.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        alert(message);
        return false;
      }

      const data = await res.json();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("memory-saved"));
      }

      console.log("Draft memory saved:", data.memory);
      return true;
    } catch (error) {
      console.error("Error saving draft memory:", error);
      alert("Sorry, something went wrong saving your memory.");
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }

  // 💳 Stripe checkout – now includes draft-save step
  async function handleCheckout() {
    if (selectedTileIndex === null) {
      alert("Please select a tile on the wall first.");
      return;
    }

    const draftOk = await saveDraftMemory();
    if (!draftOk) return;

    try {
      setIsCheckoutLoading(true);

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tileIndex: selectedTileIndex,
          wallSlug,
        }),
      });

      if (!res.ok) {
        let message = `Checkout failed (status ${res.status})`;
        try {
          const data = await res.json();
          if (data?.error) {
            message = data.error;
          }
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("No checkout URL returned.");
      }
    } catch (error: any) {
      console.error("Checkout error", error);
      alert(error?.message || "Sorry, something went wrong starting checkout.");
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  const hasSelection = selectedTileIndex !== null;

  return (
    <section
      id="add-memory"
      className="mt-10 rounded-3xl border border-slate-800 bg-slate-950/90 px-5 py-6 text-slate-100 sm:px-8 sm:py-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
            Add a memory to {wallLabelForForm}
          </p>
          <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
            Claim this tile with a story that matters to you.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            It can be a story, a thought, a joke, a dedication, a meme or a
            quiet moment.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Currently selected:{" "}
            <span className="font-medium text-slate-200">{selectedLabel}</span>
          </p>
        </div>
      </div>

      {/* STEP 1 – payment + random tile */}
      <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-900/10 via-emerald-900/5 to-teal-900/10 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-300/80">
              Step 1 · Pay for this tile
            </p>
            <p className="mt-1 text-xs text-emerald-100/90"></p>
            <p className="mt-1 text-xs text-emerald-100/90">
              Each tile on {wallLabelForForm} costs{" "}
              <span className="font-semibold">
                ${priceUsd.toFixed(2)} USD
              </span>
              . Your bank will convert this to your local currency.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            {/* 🎲 Random tile */}
            <button
              type="button"
              onClick={handleRandomTile}
              disabled={isRandomPicking}
              className="
                inline-flex items-center justify-center rounded-full
                border border-emerald-500/70 bg-transparent
                px-4 py-2 text-xs font-medium text-emerald-200
                hover:bg-emerald-500/10 hover:border-emerald-300
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {isRandomPicking ? "Picking a tile…" : "🎲 Random tile for me"}
            </button>

            {/* Checkout (saves draft + starts payment) */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={!hasSelection || isCheckoutLoading || isSavingDraft}
              className={`
                inline-flex items-center justify-center rounded-full
                px-4 py-2 text-xs font-semibold
                ${
                  hasSelection
                    ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                    : "bg-emerald-900/40 text-emerald-300/60"
                }
                disabled:cursor-not-allowed
                border border-emerald-400/70 shadow-[0_0_25px_rgba(52,211,153,0.25)]
              `}
            >
              {isCheckoutLoading || isSavingDraft
                ? "Saving & starting checkout…"
                : hasSelection
                ? `Pay $${priceUsd.toFixed(2)} & publish`
                : "Select a tile on the wall first"}
            </button>
          </div>
        </div>
      </div>

      {/* STEP 2 – story form */}
      <div className="mt-6 space-y-4 rounded-2xl border border-slate-800/80 bg-slate-950/80 px-4 py-5 sm:px-6 sm:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
          Step 2 · Write your memory
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium text-slate-200">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="Give this moment a name"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium text-slate-200">
              Your story
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="Write a story, memory, thought, dedication, joke, or quiet moment…"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-200">
              Your name (optional)
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              placeholder="How should we credit this memory?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-200">
              Accent colour
            </label>
            <select
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value as AccentColor)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="blue">Blue</option>
              <option value="orange">Orange</option>
              <option value="green">Green</option>
              <option value="lavender">Lavender</option>
              <option value="gold">Gold</option>
              <option value="none">None</option>
            </select>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-medium text-slate-200">
              Attach an image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-100 hover:file:bg-slate-700"
            />
            {imageData && (
              <p className="text-[11px] text-emerald-300">
                Image attached (compressed). It will be used for your tile
                thumbnail.
              </p>
            )}
          </div>
        </div>

        {/* Guidelines hint */}
        <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
          By paying and publishing, you agree to our community guidelines:
          <span className="block sm:inline">
            {" "}
            no hate or slurs, no harassment or doxxing, no illegal content, no
            explicit sexual imagery, and no graphic violence.
          </span>{" "}
          Honest stories, jokes, memes and emotion are welcome — just keep it
          human and respectful.
        </p>
      </div>
    </section>
  );
}
