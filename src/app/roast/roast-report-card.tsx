import type { RoastResult } from "@/lib/schema";
import { WEIGHTS, type Stats } from "@/lib/stats";

type Props = {
  stats: Stats;
  roast: RoastResult;
};

const SIGNALS = [
  { key: "clickbait", label: "Title patterns" },
  { key: "categories", label: "Video categories" },
  { key: "concentration", label: "Repeat creators" },
  { key: "shorts", label: "Shorts proxy" },
] as const;

export function RoastReportCard({ stats, roast }: Props) {
  return (
    <article
      aria-labelledby="report-headline"
      className="border border-control bg-panel p-6 text-content shadow-[6px_6px_0_var(--line-strong)] sm:p-8"
    >
      <header className="border-b border-hairline pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.1em] text-content-muted">
            Scorched / the verdict
          </p>
          <p className="font-mono text-xs tabular-nums text-content-muted">
            {stats.total} liked videos checked
          </p>
        </div>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
              The verdict
            </p>
            <h2
              className="mt-3 max-w-[18ch] break-words font-display text-4xl font-medium leading-[1.08] tracking-[-0.03em] sm:text-5xl"
              id="report-headline"
            >
              {roast.headline}
            </h2>
          </div>
          <div className="border-s-2 border-accent ps-4 sm:min-w-36">
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted">
              Brainrot score
            </p>
            <p className="mt-1 font-display text-6xl font-medium leading-none tabular-nums">
              {roast.brainrotScore}
              <span className="ms-1 font-mono text-sm text-content-muted">
                /100
              </span>
            </p>
            <p className="mt-2 text-xs text-content-muted">
              Heuristic, not science
            </p>
          </div>
        </div>
      </header>

      <section
        aria-labelledby="personality-title"
        className="border-b border-hairline py-6"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
          Your viewing type
        </p>
        <h3
          className="mt-2 break-words font-display text-3xl font-medium leading-tight sm:text-4xl"
          id="personality-title"
        >
          {roast.personalityLabel}
        </h3>
        <p className="mt-3 max-w-2xl break-words leading-7 text-content-muted">
          {roast.description}
        </p>
      </section>

      {stats.lowConfidence && (
        <p className="border-b border-hairline bg-canvas-soft px-4 py-3 text-sm leading-6">
          Small non-music sample. The score is less certain, so take the
          verdict lightly.
        </p>
      )}

      <section aria-labelledby="burns-title" className="py-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3
            className="font-display text-3xl font-medium leading-tight"
            id="burns-title"
          >
            The evidence
          </h3>
          <p className="text-sm text-content-muted">
            Every joke points to a number or a title.
          </p>
        </div>
        <ol className="mt-3 divide-y divide-hairline">
          {roast.burns.map((burn, index) => (
            <li
              className="grid gap-3 py-5 first:pt-4 sm:grid-cols-[2.5rem_1fr]"
              key={`${burn.evidence.id}-${index}`}
            >
              <span className="font-mono text-xs tabular-nums text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="break-words font-display text-xl leading-[1.4] sm:text-2xl">
                  {burn.text}
                </p>
                <p className="mt-3 break-words border-s-2 border-accent ps-3 text-sm leading-6 text-content-muted">
                  <span className="font-semibold text-content">
                    {burn.evidence.label}:
                  </span>{" "}
                  {burn.evidence.kind === "title"
                    ? `“${burn.evidence.value}”`
                    : burn.evidence.value}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <details className="border-t border-hairline pt-5">
        <summary className="w-fit cursor-pointer text-sm font-semibold underline decoration-strong underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
          Show the score math
        </summary>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {SIGNALS.map(({ key, label }) => (
            <li
              className="flex items-baseline justify-between gap-3 border-b border-hairline pb-2 text-sm"
              key={key}
            >
              <span>{label}</span>
              <span className="font-mono tabular-nums text-content-muted">
                {(stats.signals[key] * WEIGHTS[key]).toFixed(1)} /{" "}
                {WEIGHTS[key]}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-content-muted">
          Counts and category IDs set the score. Gemini writes the jokes, not
          the facts. Category and Shorts checks are estimates, not a judgment
          of what you should watch. Signal points are shown to one decimal;
          the total is rounded to a whole number. These starting weights are
          uncalibrated.
        </p>
      </details>

      <footer className="mt-5 border-t border-hairline pt-4 text-sm text-content-muted">
        Your taste was not graded. The patterns were. This report is not saved.
      </footer>
    </article>
  );
}

export function ScoreOnlyCard({
  stats,
  pending,
}: {
  stats: Stats;
  pending: boolean;
}) {
  return (
    <article
      aria-labelledby="score-only-title"
      className="border border-control bg-panel p-6 text-content shadow-[6px_6px_0_var(--line-strong)] sm:p-8"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted">
        Score calculated from your likes
      </p>
      <h2
        className="mt-3 border-s-2 border-accent ps-4 font-display text-6xl font-medium leading-none tabular-nums"
        id="score-only-title"
      >
        {stats.brainrotScore}
        <span className="ms-1 font-mono text-sm text-content-muted">/100</span>
      </h2>
      <p className="mt-5 max-w-xl text-sm leading-6 text-content-muted">
        {pending
          ? "The score is in. Gemini is still trying to make your likes sound cool."
          : "The roast is unavailable right now. This score comes from code-counted signals and does not depend on Gemini."}
      </p>
      {stats.lowConfidence && (
        <p className="mt-4 text-sm leading-6 text-content-muted">
          Small non-music sample: this score is less certain.
        </p>
      )}
    </article>
  );
}
