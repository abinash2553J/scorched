import { z } from "zod";
import type { VideoRecord } from "./schema";

// ---- Tunables -------------------------------------------------------------
// YouTube does not expose a Shorts flag; duration is only a rough proxy.
export const SHORTS_MAX_SEC = 180;

// UNCALIBRATED starting values: educated guesses, not fitted to any one account.
// Weights sum to 100. Set weights and ranges from the distribution across many
// opt-in users (store signal vectors only, never titles), not from a single profile.
export const WEIGHTS = {
  clickbait: 35,
  categories: 25,
  concentration: 20,
  shorts: 20,
} as const;

// Each raw value is mapped to 0..1 between [lo, hi] before weighting.
const RANGES = {
  clickbait: [0.05, 0.5],
  categories: [0.2, 0.8], // share of selected YouTube categories
  concentration: [0.15, 0.6],
  shorts: [0.0, 0.4],
} as const;

const MIN_SAMPLE = 10;

// YouTube category IDs. Creators pick these themselves, so treat them as a rough hint.
const MUSIC = "10";
const CATEGORY_SIGNAL_IDS = new Set(["20", "22", "23", "24"]);

// ---- Title heuristics (language-agnostic: no word lists) -------------------
// Caps detection only fires on Latin script; other scripts simply score 0 here.
const EMOJI = /\p{Extended_Pictographic}/u;
const CAPS_WORD = /\b[A-Z]{4,}\b/g;
const CAPS_ALLOW = new Set(["OFFICIAL", "VIDEO", "MUSIC", "VEVO", "LIVE"]);
const HASHTAG_BAIT = /#(shorts|viral|fyp|trending)/i;
const PUNCT_BAIT = /(!!|\?!|!\?)/;

export function clickbaitHits(title: string): number {
  let hits = 0;
  if (EMOJI.test(title)) hits++;
  const caps = (title.match(CAPS_WORD) ?? []).filter((w) => !CAPS_ALLOW.has(w));
  if (caps.length > 0) hits++;
  if (PUNCT_BAIT.test(title)) hits++;
  if (HASHTAG_BAIT.test(title)) hits++;
  return hits;
}

export const isAutoTopic = (v: VideoRecord) => v.channel.endsWith(" - Topic");
export const isMusic = (v: VideoRecord) =>
  v.categoryId === MUSIC || isAutoTopic(v);
const norm = (x: number, [lo, hi]: readonly [number, number]) =>
  Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
const share = (n: number, d: number) => (d ? n / d : 0);

// ---- Stats ----------------------------------------------------------------
const ChannelCount = z.object({
  channel: z.string(),
  count: z.number().int().nonnegative(),
});

export const StatsSchema = z.object({
  total: z.number().int().nonnegative(),
  nonMusicCount: z.number().int().nonnegative(),
  lowConfidence: z.boolean(),
  musicShare: z.number().min(0).max(1),
  autoTopicTracks: z.number().int().nonnegative(),
  topChannels: z.array(ChannelCount),
  topChannelShare: z.number().min(0).max(1),
  bingeChannels: z.array(ChannelCount),
  shortsCount: z.number().int().nonnegative(),
  shortsShare: z.number().min(0).max(1),
  baitCount: z.number().int().nonnegative(),
  baitShare: z.number().min(0).max(1),
  baitExamples: z.array(z.string()),
  categoryCount: z.number().int().nonnegative(),
  categoryShare: z.number().min(0).max(1),
  signals: z.object({
    clickbait: z.number().min(0).max(1),
    categories: z.number().min(0).max(1),
    concentration: z.number().min(0).max(1),
    shorts: z.number().min(0).max(1),
  }),
  brainrotScore: z.number().int().min(0).max(100),
});

export type Stats = z.infer<typeof StatsSchema>;

export function computeStats(videos: VideoRecord[]): Stats {
  const total = videos.length;
  const nonMusic = videos.filter((v) => !isMusic(v));
  const nonTopic = videos.filter((v) => !isAutoTopic(v));

  // Channel counts (skip "- Topic" so a playlist of songs doesn't look like a fixation)
  const counts = new Map<string, number>();
  for (const v of nonTopic) counts.set(v.channel, (counts.get(v.channel) ?? 0) + 1);
  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([channel, count]) => ({ channel, count }));
  const top3 = ranked.slice(0, 3).reduce((s, c) => s + c.count, 0);

  const shorts = videos.filter(
    (v) =>
      (v.durationSec ?? Infinity) <= SHORTS_MAX_SEC || /#shorts/i.test(v.title)
  );

  const baity = nonMusic.filter((v) => clickbaitHits(v.title) >= 2);
  const categoryVideos = nonMusic.filter((v) =>
    CATEGORY_SIGNAL_IDS.has(v.categoryId ?? "")
  );
  const categoryShare = share(categoryVideos.length, nonMusic.length);

  const raw = {
    clickbait: share(baity.length, nonMusic.length),
    categories: categoryShare,
    concentration: share(top3, nonTopic.length),
    shorts: share(shorts.length, total),
  };

  const signals = {
    clickbait: norm(raw.clickbait, RANGES.clickbait),
    categories: norm(raw.categories, RANGES.categories),
    concentration: norm(raw.concentration, RANGES.concentration),
    shorts: norm(raw.shorts, RANGES.shorts),
  };

  const brainrotScore = total
    ? Math.round(
        (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).reduce(
          (sum, k) => sum + signals[k] * WEIGHTS[k],
          0
        )
      )
    : 0;

  return {
    total,
    nonMusicCount: nonMusic.length,
    lowConfidence: nonMusic.length < MIN_SAMPLE,
    musicShare: share(videos.filter(isMusic).length, total),
    autoTopicTracks: videos.filter(isAutoTopic).length,
    topChannels: ranked.slice(0, 5),
    topChannelShare: raw.concentration,
    bingeChannels: ranked.filter((c) => c.count >= 3),
    shortsCount: shorts.length,
    shortsShare: raw.shorts,
    baitCount: baity.length,
    baitShare: raw.clickbait,
    baitExamples: baity.slice(0, 3).map((v) => v.title.trim()),
    categoryCount: categoryVideos.length,
    categoryShare,
    signals,
    brainrotScore,
  };
}