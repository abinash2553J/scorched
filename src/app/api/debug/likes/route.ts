import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchLikedVideos } from "@/lib/youtube";

// Dev-only: dumps your normalized liked videos so you can sanity-check the fetchers.
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const session = await auth();
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  const videos = await fetchLikedVideos(session.accessToken, 50);
  return NextResponse.json({ count: videos.length, videos });
}
