"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { CAMPUS_CENTER } from "@/lib/demo-stories";
import type { Story } from "@/lib/types";

type LatLng = { lat: number; lng: number };
type KakaoLatLng = { getLat(): number; getLng(): number };
type KakaoMap = {
  setCenter(position: unknown): void;
  setLevel(level: number): void;
  getLevel(): number;
};
type KakaoMarker = {
  setMap(map: KakaoMap | null): void;
  getPosition(): KakaoLatLng;
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
        CustomOverlay: new (options: {
          map: KakaoMap;
          position: unknown;
          content: HTMLElement;
          yAnchor: number;
          zIndex: number;
        }) => { setMap(map: KakaoMap | null): void };
        Marker: new (options: {
          map: KakaoMap;
          position: unknown;
          draggable: boolean;
        }) => KakaoMarker;
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
  testPositionEnabled: boolean;
  onSelect(story: Story): void;
  onDraftPoint(point: LatLng): void;
  onTestPosition(point: LatLng): void;
};

export function YonseiMap({
  stories,
  selectedId,
  mode,
  draftPoint,
  userPosition,
  testPositionEnabled,
  onSelect,
  onDraftPoint,
  onTestPosition,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const overlaysRef = useRef<Array<{ setMap(map: KakaoMap | null): void }>>([]);
  const [sdkReady, setSdkReady] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  useEffect(() => {
    if (!sdkReady || !containerRef.current || !window.kakao) return;
    window.kakao.maps.load(() => {
      if (!containerRef.current || !window.kakao) return;
      const map = new window.kakao.maps.Map(containerRef.current, {
        center: new window.kakao.maps.LatLng(CAMPUS_CENTER.lat, CAMPUS_CENTER.lng),
        level: 3,
      });
      mapRef.current = map;
      const syncPinScale = () => {
        const level = map.getLevel();
        const scale = Math.max(0.38, Math.min(1, 1 - (level - 3) * 0.1));
        containerRef.current?.style.setProperty("--map-pin-scale", scale.toString());
      };
      syncPinScale();
      window.kakao.maps.event.addListener(map, "zoom_changed", syncPinScale);
      setMapReady(true);
      window.kakao.maps.event.addListener(map, "click", (event) => {
        const point = {
          lat: event.latLng.getLat(),
          lng: event.latLng.getLng(),
        };
        if (mode === "create") onDraftPoint(point);
        if (testPositionEnabled) onTestPosition(point);
      });
    });
  }, [sdkReady, mode, testPositionEnabled, onDraftPoint, onTestPosition]);

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
      overlays.push(
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(story.latitude, story.longitude),
          content: button,
          yAnchor: 1,
          zIndex: selectedId === story.id ? 6 : 3,
        }),
      );
    });

    if (mode === "create") {
      const draftMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(draftPoint.lat, draftPoint.lng),
        draggable: true,
      });
      kakao.maps.event.addListener(draftMarker, "dragend", () => {
        const position = draftMarker.getPosition();
        onDraftPoint({ lat: position.getLat(), lng: position.getLng() });
      });
      overlays.push(draftMarker);
    }

    if (userPosition && testPositionEnabled) {
      const testMarker = new kakao.maps.Marker({
        map,
        position: new kakao.maps.LatLng(userPosition.lat, userPosition.lng),
        draggable: true,
      });
      kakao.maps.event.addListener(testMarker, "dragend", () => {
        const position = testMarker.getPosition();
        onTestPosition({ lat: position.getLat(), lng: position.getLng() });
      });
      overlays.push(testMarker);
    } else if (userPosition) {
      const userDot = document.createElement("div");
      userDot.className = "user-location-dot";
      overlays.push(
        new kakao.maps.CustomOverlay({
          map,
          position: new kakao.maps.LatLng(userPosition.lat, userPosition.lng),
          content: userDot,
          yAnchor: 0.5,
          zIndex: 9,
        }),
      );
    }
    overlaysRef.current = overlays;
  }, [
    mapReady,
    stories,
    selectedId,
    mode,
    draftPoint,
    userPosition,
    testPositionEnabled,
    onSelect,
    onDraftPoint,
    onTestPosition,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    const kakao = window.kakao;
    if (!map || !kakao || !userPosition) return;
    map.setCenter(new kakao.maps.LatLng(userPosition.lat, userPosition.lng));
    map.setLevel(3);
  }, [mapReady, userPosition]);

  if (!apiKey || loadFailed) {
    return (
      <div className="map-fallback">
        <div className="fallback-grid" />
        <div className="fallback-campus">
          <span>SINCHON CAMPUS · OFFLINE GRID</span>
          <strong>YONSEI<br />AFTERDARK</strong>
          <p>
            Kakao 지도 키 또는 로컬 도메인 등록을 확인해주세요. GPS와 로컬 사연
            저장은 계속 사용할 수 있습니다.
          </p>
        </div>
        {stories.map((story, index) => (
          <button
            key={story.id}
            className={`fallback-pin ${selectedId === story.id ? "selected" : ""}`}
            style={{
              left: `${14 + ((index * 19) % 72)}%`,
              top: `${14 + ((index * 29) % 70)}%`,
              background: story.color,
              boxShadow: `0 0 10px ${story.color}, 0 0 25px ${story.color}`,
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
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() => setLoadFailed(true)}
      />
      <div ref={containerRef} className="kakao-map" aria-label="연세대학교 신촌캠퍼스 지도" />
    </>
  );
}
