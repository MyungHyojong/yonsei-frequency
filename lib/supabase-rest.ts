import type { Story, StoryInput } from "./types";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(url && serviceKey);

function headers(prefer?: string) {
  return {
    apikey: serviceKey!,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

export async function listStories(): Promise<Story[]> {
  const response = await fetch(
    `${url}/rest/v1/stories?select=*&status=eq.published&order=created_at.desc`,
    { headers: headers(), cache: "no-store" },
  );
  if (!response.ok) throw new Error(`Supabase read failed: ${response.status}`);
  return response.json();
}

export async function listNearbyStories(
  latitude: number,
  longitude: number,
  radius: number,
): Promise<Story[]> {
  const response = await fetch(`${url}/rest/v1/rpc/nearby_stories`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      user_lat: latitude,
      user_lng: longitude,
      radius_m: radius,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase RPC failed: ${response.status}`);
  return response.json();
}

export async function createStory(input: StoryInput): Promise<Story> {
  const colors = ["#ff6b4a", "#6550d8", "#178a64", "#e5a52a"];
  const response = await fetch(`${url}/rest/v1/stories`, {
    method: "POST",
    headers: headers("return=representation"),
    body: JSON.stringify({
      place: input.place,
      title: input.title,
      story: input.story,
      nickname: input.nickname,
      youtube_id: input.youtube_id,
      latitude: input.latitude,
      longitude: input.longitude,
      color: colors[Math.floor(Math.random() * colors.length)],
      status: "published",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase insert failed: ${response.status}`);
  const rows = (await response.json()) as Story[];
  return rows[0];
}
