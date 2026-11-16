"use client";

import { useEffect, useRef, useState } from "react";
import type { RoastResult } from "@/lib/schema";
import type { Stats } from "@/lib/stats";
import { ScorchedBrand } from "../scorched-brand";

type Props = {
  roast: RoastResult;
  stats: Stats;
  onClose: () => void;
};

type Format = "square" | "story";

export function RoastExportDialog({ roast, stats, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<Format>("square");
  const [busy, setBusy] = useState<"download" | "copy" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  async function renderCard() {
    const card = cardRef.current;
    if (!card) throw new Error("The card preview is not available.");

    await document.fonts.ready;
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(card, {
      backgroundColor: "#fffefa",
      pixelRatio: 2,
    });
    if (!blob) throw new Error("The card image could not be created.");
    return blob;
  }

  async function downloadCard() {
    setBusy("download");
    setError("");
    setNotice("");

    try {
      const blob = await renderCard();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scorched-roast-${format}.png`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("PNG downloaded.");
    } catch {
      setError("Could not render the PNG. Try again or copy the report text.");
    } finally {
      setBusy(null);
    }
  }

  async function copyCard() {
    setBusy("copy");
    setError("");
    setNotice("");

    try {
      if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
        setError("Image copying is unavailable here. Use Download PNG instead.");
        return;
      }

      const blob = await renderCard();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setNotice("Roast card copied as an image.");
    } catch {
      setError("Could not copy the image. Use Download PNG instead.");
    } finally {
      setBusy(null);
    }
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  const featuredBurn = roast.burns[0];
  const isSquare = format === "square";
  const cardAspect = isSquare
    ? "aspect-square max-w-[26rem]"
    : "aspect-[9/16] max-w-xs";

  return (
    <dialog
      aria-describedby="export-dialog-description"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 m-auto max-h-[90dvh] w-[min(96vw,64rem)] overflow-y-auto overscroll-contain border border-control bg-canvas p-0 text-content"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeDialog();
      }}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
                Export / private snapshot
              </p>
              <h2
                className="mt-2 font-display text-3xl font-medium leading-tight"
                id="export-dialog-title"
              >
                Your roast, ready to travel.
              </h2>
            </div>
            <button
              className="min-h-10 shrink-0 rounded-sm border border-control bg-panel px-3 py-2 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              onClick={closeDialog}
              type="button"
            >
              Close
            </button>
          </div>

          <figure className="mt-6 grid w-full min-w-0 justify-items-center">
            <div
              aria-label="Preview of your Scorched roast card"
              className={`flex w-full min-w-0 min-h-0 flex-col justify-between border border-control bg-panel text-content ${
                isSquare
                  ? "gap-0 p-2 sm:p-6"
                  : "gap-1 p-2 sm:gap-2 sm:p-6"
              } ${cardAspect}`}
              ref={cardRef}
              role="group"
            >
              <div
                className="flex items-center justify-between gap-3 border-b border-hairline pb-2 sm:pb-4"
              >
                <ScorchedBrand compact />
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-content-muted">
                  {stats.total} likes
                </span>
              </div>
              <div
                className={
                  isSquare ? "flex items-end justify-between gap-2 sm:block" : ""
                }
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
                  Brainrot score
                </p>
                <p
                  className={`mt-1 font-display font-medium leading-none tabular-nums ${
                    isSquare
                      ? "text-3xl sm:text-6xl"
                      : "text-4xl sm:text-6xl"
                  }`}
                >
                  {roast.brainrotScore}
                  <span className="ms-1 font-mono text-sm text-content-muted">
                    /100
                  </span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
                  Your viewing type
                </p>
                <h3
                  className={`mt-1 break-words font-display font-medium leading-tight sm:mt-2 ${
                    isSquare
                      ? "text-base sm:text-3xl"
                      : "text-xl sm:text-3xl"
                  }`}
                >
                  {roast.personalityLabel}
                </h3>
              </div>
              {featuredBurn && (
                <div className="border-t border-hairline pt-2 sm:pt-4">
                  <p
                    className={`break-words font-display ${
                      isSquare
                        ? "line-clamp-2 text-sm leading-[1.35] sm:line-clamp-3 sm:text-lg sm:leading-[1.4]"
                        : "line-clamp-3 text-sm leading-[1.4] sm:line-clamp-5 sm:text-lg"
                    }`}
                  >
                    {featuredBurn.text}
                  </p>
                  <p
                    className={`mt-2 break-words border-s-2 border-accent ps-3 text-xs leading-4 text-content-muted sm:mt-3 sm:leading-5 ${
                      isSquare
                        ? "line-clamp-1 sm:line-clamp-2"
                        : "line-clamp-1 sm:line-clamp-3"
                    }`}
                  >
                    <span className="font-semibold text-content">
                      {featuredBurn.evidence.label}:
                    </span>{" "}
                    {featuredBurn.evidence.kind === "title"
                      ? `“${featuredBurn.evidence.value}”`
                      : featuredBurn.evidence.value}
                  </p>
                </div>
              )}
              <p
                className={`border-t border-hairline font-mono text-[10px] leading-4 text-content-muted ${
                  isSquare ? "pt-2 sm:pt-2" : "pt-2 sm:pt-4"
                }`}
              >
                <span className="sm:hidden">Real data. AI jokes. Not saved.</span>
                <span className="hidden sm:inline">
                  Real receipts. Gemini jokes. Not saved.
                </span>
              </p>
            </div>
            <figcaption className="mt-3 max-w-md min-w-0 text-center text-xs leading-5 text-content-muted">
              This card includes your score, viewing type, and first cited
              burn. Cards shorten the burn and evidence as needed to fit; the
              full report stays available on this page.
            </figcaption>
          </figure>
        </div>

        <section
          aria-labelledby="export-options-title"
          className="min-w-0 border-t border-hairline pt-5 lg:border-s lg:border-t-0 lg:ps-6 lg:pt-0"
        >
          <h3
            className="font-display text-2xl font-medium"
            id="export-options-title"
          >
            Export options
          </h3>
          <p
            className="mt-2 text-sm leading-6 text-content-muted"
            id="export-dialog-description"
          >
            Choose a shape, then download a 2× PNG or copy the image. No public
            link or archive is created.
          </p>

          <div
            aria-label="Card format"
            className="mt-5 grid grid-cols-2 gap-2"
            role="group"
          >
            <button
              aria-pressed={format === "square"}
              className={`min-h-11 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                format === "square"
                  ? "border-accent bg-canvas-soft"
                  : "border-control bg-panel hover:bg-canvas-soft"
              }`}
              onClick={() => setFormat("square")}
              disabled={busy !== null}
              type="button"
            >
              1:1 Feed
            </button>
            <button
              aria-pressed={format === "story"}
              className={`min-h-11 rounded-sm border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${
                format === "story"
                  ? "border-accent bg-canvas-soft"
                  : "border-control bg-panel hover:bg-canvas-soft"
              }`}
              onClick={() => setFormat("story")}
              disabled={busy !== null}
              type="button"
            >
              9:16 Story
            </button>
          </div>

          <div className="mt-5 grid gap-2">
            <button
              className="min-h-11 rounded-sm bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait"
              disabled={busy !== null}
              onClick={downloadCard}
              type="button"
            >
              {busy === "download" ? "Rendering PNG…" : "Download PNG · 2×"}
            </button>
            <button
              className="min-h-11 rounded-sm border border-control bg-panel px-4 py-2 text-sm font-semibold transition-colors hover:bg-solid hover:text-on-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait"
              disabled={busy !== null}
              onClick={copyCard}
              type="button"
            >
              {busy === "copy" ? "Copying image…" : "Copy image"}
            </button>
          </div>

          <p
            className={notice ? "mt-4 text-sm text-content-muted" : "sr-only"}
            role="status"
          >
            {notice}
          </p>
          <p
            className={error ? "mt-4 text-sm leading-6 text-accent" : "sr-only"}
            role="alert"
          >
            {error}
          </p>
        </section>
      </div>
    </dialog>
  );
}
