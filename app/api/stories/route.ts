import { NextRequest, NextResponse } from "next/server";
import { CAMPUS_BOUNDS, demoStories } from "@/lib/demo-stories";
import {
  createStory,
  isSupabaseConfigured,
  listNearbyStories,
  listStories,
} from "@/lib/supabase-rest";
import type { StoryInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const youtubePattern =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

function withinCampus(latitude: number, longitude: number) {
  return (
    latitude >= CAMPUS_BOUNDS.south &&
    latitude <= CAMPUS_BOUNDS.north &&
    longitude >= CAMPUS_BOUNDS.west &&
    longitude <= CAMPUS_BOUNDS.east
  );
}

export async function GET(request: NextRequest) {
  const lat = Number(request.nextUrl.searchParams.get("lat"));
  const lng = Number(request.nextUrl.searchParams.get("lng"));
  const radius = Math.min(
    500,
    Math.max(20, Number(request.nextUrl.searchParams.get("radius")) || 50),
  );

  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ stories: demoStories, demo: true });
    }
    const stories =
      Number.isFinite(lat) && Number.isFinite(lng)
        ? await listNearbyStories(lat, lng, radius)
        : await listStories();
    return NextResponse.json({ stories, demo: false });
  } catch {
    return NextResponse.json(
      { error: "사연을 불러오지 못했습니다." },
      { status: 502 },
    );
  }
}

export async function POST(request: NextRequest) {
  let body: StoryInput;
  try {
    body = (await request.json()) as StoryInput;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const match = body.youtube_url?.match(youtubePattern);
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  if (body.quiz_answer !== "1885") {
    return NextResponse.json(
      { error: "연세 퀴즈 인증이 필요합니다." },
      { status: 403 },
    );
  }
  if (
    !body.title?.trim() ||
    !body.story?.trim() ||
    !body.nickname?.trim() ||
    !body.place?.trim() ||
    !match
  ) {
    return NextResponse.json(
      { error: "입력 내용을 다시 확인해주세요." },
      { status: 400 },
    );
  }
  if (!withinCampus(latitude, longitude)) {
    return NextResponse.json(
      { error: "신촌캠퍼스 안에 핀을 놓아주세요." },
      { status: 400 },
    );
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "현재 샘플 모드입니다. Supabase 환경변수를 연결하면 사연이 공용으로 저장됩니다.",
      },
      { status: 503 },
    );
  }

  try {
    const story = await createStory({
      ...body,
      latitude,
      longitude,
      youtube_id: match[1],
      title: body.title.trim().slice(0, 60),
      story: body.story.trim().slice(0, 500),
      nickname: body.nickname.trim().slice(0, 20),
      place: body.place.trim().slice(0, 40),
    });
    return NextResponse.json({ story }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "사연을 저장하지 못했습니다." },
      { status: 502 },
    );
  }
}
