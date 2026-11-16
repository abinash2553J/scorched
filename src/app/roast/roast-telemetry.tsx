import { WEIGHTS, type Stats } from "@/lib/stats";

type Props = {
  stats: Stats | null;
};

const SIGNALS = [
  { key: "clickbait", label: "Title patterns" },
  { key: "categories", label: "Selected categories" },
  { key: "concentration", label: "Repeat creators" },
  { key: "shorts", label: "Shorts proxy" },
] as const;

function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="grid gap-1 border-b border-hairline py-4 last:border-b-0">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="font-mono text-sm tabular-nums text-content">
        {value}
      </dd>
      <dd className="text-xs leading-5 text-content-muted">{detail}</dd>
    </div>
  );
}

export function RoastTelemetry({ stats }: Props) {
  const nonTopicCount = stats
    ? Math.max(0, stats.total - stats.autoTopicTracks)
    : 0;
  const topThreeCount = stats
    ? stats.topChannels
        .slice(0, 3)
        .reduce((total, channel) => total + channel.count, 0)
    : 0;

  return (
    <aside className="space-y-5" id="telemetry">
      <article
        aria-labelledby="telemetry-title"
        className="border border-control bg-panel p-5 sm:p-6"
      >
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-hairline pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-content-muted">
              Computed from your likes
            </p>
            <h2
              className="mt-2 font-display text-3xl font-medium leading-tight"
              id="telemetry-title"
            >
              The cold hard numbers
            </h2>
          </div>
          <span className="border border-control px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em]">
            {stats ? `${stats.total} sampled` : "Awaiting data"}
          </span>
        </header>

        {stats ? (
          <>
            <dl className="mt-1">
              <Metric
                label="Title-pattern flags"
                value={
                  stats.nonMusicCount
                    ? `${stats.baitCount} / ${stats.nonMusicCount} · ${percentage(stats.baitShare)}`
                    : "No non-music videos"
                }
                detail="Counted when a title matches at least two pattern checks."
              />
              <Metric
                label="Selected categories"
                value={
                  stats.nonMusicCount
                    ? `${stats.categoryCount} / ${stats.nonMusicCount} · ${percentage(stats.categoryShare)}`
                    : "No non-music videos"
                }
                detail="YouTube categories 20, 22, 23, or 24; category is a rough hint."
              />
              <Metric
                label="Top 3 channel share"
                value={
                  nonTopicCount
                    ? `${topThreeCount} / ${nonTopicCount} · ${percentage(stats.topChannelShare)}`
                    : "No creator-channel likes"
                }
                detail="Auto-generated “- Topic” music channels are excluded."
              />
              <Metric
                label="Shorts proxy"
                value={
                  stats.total
                    ? `${stats.shortsCount} / ${stats.total} · ${percentage(stats.shortsShare)}`
                    : "No liked videos"
                }
                detail="Videos up to 180 seconds or with #shorts in the title; not an official Shorts flag."
              />
            </dl>

            {stats.topChannels.length > 0 && (
              <section
                aria-labelledby="top-creators-title"
                className="border-t border-hairline pt-4"
              >
                <h3
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted"
                  id="top-creators-title"
                >
                  Most-liked channels
                </h3>
                <ol className="mt-3 space-y-2">
                  {stats.topChannels.slice(0, 3).map(({ channel, count }) => (
                    <li
                      className="flex items-start justify-between gap-3 text-sm"
                      key={channel}
                    >
                      <span className="break-words">{channel}</span>
                      <span className="shrink-0 font-mono tabular-nums text-content-muted">
                        {count} likes
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {stats.baitExamples.length > 0 && (
              <section
                aria-labelledby="title-examples-title"
                className="mt-5 border-t border-hairline pt-4"
              >
                <h3
                  className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted"
                  id="title-examples-title"
                >
                  Flagged title examples
                </h3>
                <ul className="mt-3 space-y-2">
                  {stats.baitExamples.map((title, index) => (
                    <li
                      className="break-words border-s-2 border-accent ps-3 text-sm leading-6"
                      key={`${title}-${index}`}
                    >
                      “{title}”
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {stats.lowConfidence && (
              <p className="mt-5 border-s-2 border-accent bg-canvas-soft p-3 text-sm leading-6">
                Small non-music sample. Treat this score as extra rough.
              </p>
            )}

            <details className="mt-5 border-t border-hairline pt-4">
              <summary className="w-fit cursor-pointer text-sm font-semibold underline decoration-strong underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                How the score is weighted
              </summary>
              <ul className="mt-3 space-y-2">
                {SIGNALS.map(({ key, label }) => (
                  <li
                    className="flex items-baseline justify-between gap-3 text-sm"
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
                The score uses deterministic but uncalibrated weights. It is a
                joke metric, not a scientific measure. Gemini writes the
                comedy, not the numbers.
              </p>
            </details>
          </>
        ) : (
          <p className="py-8 text-sm leading-6 text-content-muted">
            Your metrics will appear here as soon as the video check finishes.
            No sample numbers, no guessing.
          </p>
        )}
      </article>

      <div className="border-s-2 border-strong py-1 ps-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-content-muted">
          Data boundary
        </p>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          The likes list has video details, not your watch history. Scorched
          cannot report when you watched or how long you watched.
        </p>
      </div>
    </aside>
  );
}
