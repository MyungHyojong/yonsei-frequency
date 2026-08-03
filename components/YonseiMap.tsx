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
type KakaoDrawable = { setMap(map: KakaoMap | null): void };
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
        }) => KakaoDrawable;
        Circle: new (options: {
          map: KakaoMap;
          center: unknown;
          radius: number;
          strokeWeight: number;
          strokeColor: string;
          strokeOpacity: number;
          strokeStyle: string;
          fillColor: string;
          fillOpacity: number;
        }) => KakaoDrawable;
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
  const overlaysRef = useRef<KakaoDrawable[]>([]);
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
        const radarSize = Math.max(34, Math.min(230, 116 / Math.pow(2, level - 3)));
        containerRef.current?.style.setProperty("--radar-size", `${radarSize}px`);
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
      });
    });
  }, [sdkReady, mode, onDraftPoint]);

  useEffect(() => {
    const map = mapRef.current;
    const kakao = window.kakao;
    if (!map || !kakao) return;
    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    const overlays: KakaoDrawable[] = [];

    stories.forEach((story) => {
      const button = document.createElement("button");
      button.className = `real-map-pin ${selectedId === story.id ? "selected" : ""}`;
      button.style.setProperty("--pin-color", story.color);
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

    if (userPosition) {
      const center = new kakao.maps.LatLng(userPosition.lat, userPosition.lng);
      const radar = document.createElement("div");
      radar.className = "gps-radar";
      radar.innerHTML = '<span class="gps-radar-sweep"></span><span class="gps-radar-core"></span><b>50m</b>';

      overlays.push(
        new kakao.maps.Circle({
          map,
          center,
          radius: 50,
          strokeWeight: 1,
          strokeColor: "#7ab8ff",
          strokeOpacity: 0.9,
          strokeStyle: "solid",
          fillColor: "#7ab8ff",
          fillOpacity: 0.08,
        }),
        new kakao.maps.CustomOverlay({
          map,
          position: center,
          content: radar,
          yAnchor: 0.5,
          zIndex: 8,
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
    onSelect,
    onDraftPoint,
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
          <strong>YONSEI<br />WALKING RADIO</strong>
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
          />
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
