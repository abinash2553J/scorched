import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchLikedVideos, YouTubeError } from "@/lib/youtube";
import { computeStats } from "@/lib/stats";
import { generateRoast } from "@/lib/gemini";
import { Spice } from "@/lib/schema";
import { ApiError } from "@google/genai";

export const maxDuration = 60;

function streamEvent(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  name: string,
  data: unknown
) {
  if (controller.desiredSize === null) return;
  controller.enqueue(
    encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`)
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Your Google session expired. Sign out and sign in again." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsedSpice = Spice.safeParse(body?.spice);
  const spice = parsedSpice.success ? parsedSpice.data : "medium";

  try {
    const videos = await fetchLikedVideos(session.accessToken, 200);
    if (videos.length === 0) {
      return NextResponse.json(
        { error: "No liked videos found. Like a few videos and try again." },
        { status: 422 }
      );
    }

    const stats = computeStats(videos);
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        streamEvent(controller, encoder, "stats", { stats });
        try {
          const roast = await generateRoast(stats, videos, { spice });
          streamEvent(controller, encoder, "report", {
            report: { stats, roast },
          });
        } catch (e) {
          console.error("generateRoast failed", e);
          const error =
            e instanceof ApiError && (e.status === 429 || e.status >= 500)
              ? "Gemini is busy right now. Your score is ready; try again shortly."
              : "The roast could not be written. Your score is ready; try again.";
          streamEvent(controller, encoder, "error", { error });
        } finally {
          if (controller.desiredSize !== null) controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "Content-Type": "text/event-stream; charset=utf-8",
      },
    });
  } catch (e) {
    if (e instanceof YouTubeError && e.status === 401) {
      return NextResponse.json(
        {
          error:
            "Your YouTube access expired. Sign out, then reconnect your Google account.",
        },
        { status: 401 }
      );
    }
    if (e instanceof YouTubeError && e.status === 403) {
      return NextResponse.json(
        {
          error:
            "YouTube could not provide your liked videos. Try again later, or check that YouTube access is enabled for your Google account.",
        },
        { status: 403 }
      );
    }
    console.error(e);
    return NextResponse.json(
      { error: "Could not load your likes. Try again." },
      { status: 500 }
    );
  }
}