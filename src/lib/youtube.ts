import { z } from "zod";
import type { VideoRecord } from "./schema";

const BASE = "https://www.googleapis.com/youtube/v3";

const VideoList = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        snippet: z.object({
          title: z.string(),
          channelTitle: z.string(),
          categoryId: z.string().optional(),
          publishedAt: z.string().optional(),
        }),
        contentDetails: z.object({ duration: z.string().optional() }).optional(),
      })
    )
    .default([]),
  nextPageToken: z.string().optional(),
});

const SubscriptionList = z.object({
  items: z
    .array(
      z.object({
        snippet: z.object({
          resourceId: z.object({ channelId: z.string() }),
          title: z.string(),
        }),
      })
    )
    .default([]),
  nextPageToken: z.string().optional(),
});

export class YouTubeError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function yt<T>(
  path: string,
  params: Record<string, string>,
  token: string,
  schema: z.ZodType<T>
): Promise<T> {
  const url = `${BASE}/${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new YouTubeError(res.status, `YouTube ${path} failed`);
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    throw new YouTubeError(502, `YouTube ${path} returned invalid JSON`);
  }
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new YouTubeError(502, `YouTube ${path} returned invalid data`);
  }
  return parsed.data;
}

// ISO 8601 duration ("PT1H2M30S") -> seconds
export function parseDuration(iso: string): number | undefined {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m || m.slice(1).every((part) => part === undefined)) return undefined;
  return +(m[1] ?? 0) * 3600 + +(m[2] ?? 0) * 60 + +(m[3] ?? 0);
}

// videos.list already returns snippet + duration, so no extra batch call is needed.
export async function fetchLikedVideos(
  token: string,
  max = 200
): Promise<VideoRecord[]> {
  const out: VideoRecord[] = [];
  let pageToken: string | undefined;

  while (out.length < max) {
    const data = await yt(
      "videos",
      {
        part: "snippet,contentDetails",
        myRating: "like",
        maxResults: "50",
        ...(pageToken && { pageToken }),
      },
      token,
      VideoList
    );
    for (const v of data.items) {
      out.push({
        videoId: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        categoryId: v.snippet.categoryId,
        durationSec: v.contentDetails?.duration
          ? parseDuration(v.contentDetails.duration)
          : undefined,
        publishedAt: v.snippet.publishedAt,
        source: "liked",
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out.slice(0, max);
}

export async function fetchSubscriptions(token: string, max = 200) {
  const out: { channelId: string; title: string }[] = [];
  let pageToken: string | undefined;

  while (out.length < max) {
    const data = await yt(
      "subscriptions",
      {
        part: "snippet",
        mine: "true",
        maxResults: "50",
        ...(pageToken && { pageToken }),
      },
      token,
      SubscriptionList
    );
    for (const s of data.items) {
      out.push({
        channelId: s.snippet.resourceId.channelId,
        title: s.snippet.title,
      });
    }
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out.slice(0, max);
}
