"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { CAMPUS_CENTER } from "@/lib/demo-stories";
import type { Story } from "@/lib/types";

type LatLng = { lat: number; lng: number };

type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoMap = {
  setCenter(position: unknown): void;
  setLevel(level: number): void;
};

declare global {
  interface Window {
    kakao?: {
      maps: {
        load(callback: () => void): void;
        Map: new (
          element: HTMLElement,
          options: { center: unknown; level: number },
        ) => KakaoMap;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: {
          map: KakaoMap;
          position: unknown;
          image?: unknown;
          clickable?: boolean;
        }) => { setMap(map: KakaoMap | null): void };
        MarkerImage: new (src: string, size: unknown, options: unknown) => unknown;
        Size: new (width: number, height: number) => unknown;
        Point: new (x: number, y: number) => unknown;
        CustomOverlay: new (options: {
          map: KakaoMap;
          position: unknown;
          content: HTMLElement;
          yAnchor: number;
          zIndex: number;
        }) => { setMap(map: KakaoMap | null): void };
        event: {
          addListener(
            target: unknown,
            event: string,
            callback: (mouseEvent: { latLng: KakaoLatLng }) => void,
          ): void;
        };
      };
    };
  }
}

type Props = {
  stories: Story[];
  selectedId?: string;
  mode: "explore" | "create";
  draftPoint: LatLng;
  userPosition?: LatLng;
  onSelect(story: Story): void;
  onDraftPoint(point: LatLng): void;
};

export function YonseiMap({
  stories,
  selectedId,
  mode,
  draftPoint,
  userPosition,
  onSelect,
  onDraftPoint,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const overlaysRef = useRef<Array<{ setMap(map: KakaoMap | null): void }>>([]);
  const [sdkReady, setSdkReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.kakao) return;
    window.kakao.maps.load(() => {
      if (!containerRef.current || !window.kakao) return;
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(
          CAMPUS_CENTER.lat,
          CAMPUS_CENTER.lng,
        ),
        level: 3,
      });
      mapRef.current = map;
      window.kakao.maps.event.addListener(map, "click", (event) => {
        if (mode !== "create") return;
        onDraftPoint({
          lat: event.latLng.getLat(),
          lng: event.latLng.getLng(),
        });
      });
    });
  }, [sdkReady, mode, onDraftPoint]);

  useEffect(() => {
    const map = mapRef.current;
    const kakao = window.kakao;
    if (!map || !kakao) return;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    const overlays: Array<{ setMap(map: KakaoMap | null): void }> = [];
    stories.forEach((story) => {
      const button = document.createElement("button");
      button.className = `real-map-pin ${selectedId === story.id ? "selected" : ""}`;
      button.style.setProperty("--pin-color", story.color);
      button.innerHTML = "<span>♫</span>";
      button.setAttribute("aria-label", `${story.place}: ${story.title}`);
      button.onclick = () => onSelect(story);
      const overlay = new kakao.maps.CustomOverlay({
        map,
        position: new kakao.maps.LatLng(story.latitude, story.longitude),
        content: button,
        yAnchor: 1,
        zIndex: selectedId === story.id ? 5 : 3,
      });
      overlays.push(overlay);
    });

    if (mode === "create") {
      const draft = document.createElement("div");
      draft.className = "real-map-pin draft selected";
      draft.innerHTML = "<span>＋</span>";
      overlays.push(
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(draftPoint.lat, draftPoint.lng),
          content: draft,
          yAnchor: 1,
          zIndex: 7,
        }),
      );
    }

    if (userPosition) {
      const dot = document.createElement("div");
      dot.className = "user-location-dot";
      overlays.push(
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(userPosition.lat, userPosition.lng),
          content: dot,
          yAnchor: 0.5,
          zIndex: 8,
        }),
      );
    }
    overlaysRef.current = overlays;
  }, [
    stories,
    selectedId,
    mode,
    draftPoint,
    userPosition,
    onSelect,
  ]);

  if (!apiKey) {
    return (
      <div className="map-fallback">
        <div className="fallback-campus">
          <strong>연세대학교 신촌캠퍼스</strong>
          <span>실제 Kakao 지도 연결 대기 중</span>
          <p>
            <code>NEXT_PUBLIC_KAKAO_MAP_KEY</code>를 설정하면 건물과 도로가
            포함된 실제 지도로 전환됩니다.
          </p>
        </div>
        {stories.map((story, index) => (
          <button
            key={story.id}
            className={`fallback-pin ${selectedId === story.id ? "selected" : ""}`}
            style={{
              left: `${16 + ((index * 17) % 68)}%`,
              top: `${18 + ((index * 23) % 65)}%`,
              background: story.color,
            }}
            onClick={() => onSelect(story)}
            aria-label={`${story.place}: ${story.title}`}
          >
            ♫
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false&libraries=services,clusterer`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div ref={containerRef} className="kakao-map" aria-label="연세대학교 지도" />
    </>
  );
}
