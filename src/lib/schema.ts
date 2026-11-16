import { z } from "zod";

// One normalized record for every data source (API likes now, Takeout later).
export const VideoRecord = z.object({
  videoId: z.string(),
  title: z.string(),
  channel: z.string(),
  categoryId: z.string().optional(),
  durationSec: z.number().optional(),
  // Only set for sources that know when the user actually watched (Takeout).
  watchedAt: z.string().optional(),
  // Video publish date. NOT the watch/like time.
  publishedAt: z.string().optional(),
  source: z.enum(["liked", "playlist", "takeout"]),
});
export type VideoRecord = z.infer<typeof VideoRecord>;

export const Spice = z.enum(["gentle", "medium", "savage"]);
export type Spice = z.infer<typeof Spice>;

export const RoastEvidence = z.object({
  id: z.string().min(1).max(64),
  kind: z.enum(["number", "title"]),
  label: z.string().max(80),
  value: z.string().max(180),
});
export type RoastEvidence = z.infer<typeof RoastEvidence>;

const GeneratedBurn = z.object({
  text: z.string().max(220),
  evidenceId: z.string().min(1).max(64),
});

export const RoastText = z.object({
  headline: z.string().max(120),
  burns: z.array(GeneratedBurn).min(3).max(6),
  personalityLabel: z.string().max(40),
  description: z.string().max(400),
});
export type RoastText = z.infer<typeof RoastText>;

const RoastBurn = z.object({
  text: z.string().max(220),
  evidence: RoastEvidence,
});

export const RoastResult = z.object({
  headline: z.string().max(120),
  burns: z.array(RoastBurn).min(3).max(6),
  brainrotScore: z.number().min(0).max(100),
  personalityLabel: z.string().max(40),
  description: z.string().max(400),
});
export type RoastResult = z.infer<typeof RoastResult>;