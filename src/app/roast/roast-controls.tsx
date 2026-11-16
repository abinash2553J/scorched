"use client";

import type { Spice } from "@/lib/schema";

const SPICE_OPTIONS = [
  { value: "gentle", label: "Gentle", detail: "A friendly nudge" },
  { value: "medium", label: "Medium", detail: "The truth with seasoning" },
  { value: "savage", label: "Savage", detail: "No pattern gets a pass" },
] as const;

type Props = {
  spice: Spice;
  pending: boolean;
  hasReport: boolean;
  score: number | null;
  error: string | null;
  notice: string | null;
  onSpiceChange: (value: string) => void;
  onGenerate: () => void;
};

export function RoastControls({
  spice,
  pending,
  hasReport,
  score,
  error,
  notice,
  onSpiceChange,
  onGenerate,
}: Props) {
  const status =
    notice ??
    (hasReport && score !== null
      ? `Your roast is ready. Brainrot score: ${score} out of 100.`
      : pending
        ? score !== null
          ? `Your score is ${score} out of 100. Gemini is writing the verdict.`
          : "Checking the patterns in your likes."
        : "");

  return (
    <div className="border-b border-hairline py-6">
      <fieldset disabled={pending}>
        <legend className="text-sm font-semibold">
          Choose the roast temperature
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SPICE_OPTIONS.map((option) => (
            <label
              className={`flex cursor-pointer items-start gap-3 border p-3 transition-colors ${
                spice === option.value
                  ? "border-accent bg-canvas-soft"
                  : "border-control bg-panel hover:bg-canvas-soft"
              }`}
              key={option.value}
            >
              <input
                checked={spice === option.value}
                className="mt-1 accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                name="spice"
                onChange={(event) => onSpiceChange(event.target.value)}
                type="radio"
                value={option.value}
              />
              <span>
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-content-muted">
                  {option.detail}
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        className={`mt-5 min-h-12 rounded-sm px-6 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-wait ${
          hasReport
            ? "border border-control bg-panel text-content hover:bg-solid hover:text-on-solid"
            : "bg-accent text-on-accent hover:bg-solid hover:text-on-solid"
        }`}
        disabled={pending}
        onClick={onGenerate}
        type="button"
      >
        {pending
          ? score !== null
            ? "Writing your roast…"
            : "Counting your likes…"
          : hasReport
            ? "Build another roast"
            : "Build my roast"}
      </button>
      <p className="mt-3 text-xs leading-5 text-content-muted">
        Private report. Nothing is saved.
      </p>

      <p
        className={
          status ? "mt-4 text-sm leading-6 text-content-muted" : "sr-only"
        }
        role="status"
      >
        {status}
      </p>
      <p
        className={error ? "mt-4 text-sm leading-6 text-accent" : "sr-only"}
        role="alert"
      >
        {error}
      </p>
    </div>
  );
}
