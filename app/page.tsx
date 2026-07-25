"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { YonseiMap } from "@/components/YonseiMap";
import { CAMPUS_CENTER } from "@/lib/demo-stories";
import type { Story } from "@/lib/types";

type Mode = "explore" | "create";
type LatLng = { lat: number; lng: number };

const quizOptions = [
  { label: "1885년", value: "1885" },
  { label: "1905년", value: "1905" },
  { label: "1946년", value: "1946" },
];

function youtubeId(url: string) {
  return (
    url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
    )?.[1] ?? ""
  );
}

function distanceMeters(a: LatLng, b: LatLng) {
  const radius = 6_371_000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(value));
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("explore");
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [panelOpen, setPanelOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [verified, setVerified] = useState(false);
  const [nickname, setNickname] = useState(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("yonsei-nickname") || "",
  );
  const [draftPoint, setDraftPoint] = useState<LatLng>(CAMPUS_CENTER);
  const [userPosition, setUserPosition] = useState<LatLng>();
  const [discovered, setDiscovered] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("yonsei-discovered") || "[]");
    } catch {
      return [];
    }
  });
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [notice, setNotice] = useState(
    "현재 위치를 켜고 가까운 이야기를 발견해보세요.",
  );
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    place: "내가 고른 자리",
    title: "",
    story: "",
    youtube: "",
  });

  useEffect(() => {
    fetch("/api/stories")
      .then((response) => response.json())
      .then((data) => {
        const nextStories = (data.stories ?? []) as Story[];
        setStories(nextStories);
        setDemoMode(Boolean(data.demo));
        if (nextStories[0]) setSelectedId(nextStories[0].id);
      })
      .catch(() => setNotice("사연을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  const selected = useMemo(
    () => stories.find((story) => story.id === selectedId) ?? stories[0],
    [stories, selectedId],
  );

  const selectStory = useCallback((story: Story) => {
    setSelectedId(story.id);
    setPanelOpen(true);
  }, []);

  const updateDraftPoint = useCallback((point: LatLng) => {
    setDraftPoint(point);
  }, []);

  function enterMode(nextMode: Mode) {
    if (nextMode === "create" && !verified) {
      setQuizOpen(true);
      return;
    }
    setMode(nextMode);
    setPanelOpen(true);
  }

  function answerQuiz(answer: string) {
    if (answer !== "1885") {
      setQuizError(true);
      return;
    }
    setQuizAnswer(answer);
    setVerified(true);
    setQuizError(false);
    setQuizOpen(false);
    setMode("create");
    setPanelOpen(true);
  }

  function saveDiscoveries(ids: string[]) {
    const next = Array.from(new Set([...discovered, ...ids]));
    setDiscovered(next);
    localStorage.setItem("yonsei-discovered", JSON.stringify(next));
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setNotice("이 브라우저는 위치 기능을 지원하지 않아요.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        setUserPosition(position);
        try {
          const response = await fetch(
            `/api/stories?lat=${position.lat}&lng=${position.lng}&radius=50`,
          );
          const data = await response.json();
          const nearby = data.demo
            ? stories.filter(
                (story) =>
                  distanceMeters(position, {
                    lat: story.latitude,
                    lng: story.longitude,
                  }) <= 50,
              )
            : ((data.stories ?? []) as Story[]);
          saveDiscoveries(nearby.map((story) => story.id));
          setNotice(
            nearby.length
              ? `반경 50m 안에서 이야기 ${nearby.length}개를 발견했어요.`
              : "반경 50m 안에 아직 등록된 이야기가 없어요.",
          );
          if (nearby[0]) selectStory(nearby[0]);
        } catch {
          setNotice("가까운 이야기를 확인하지 못했습니다.");
        }
        setLocating(false);
      },
      () => {
        setNotice("위치 권한을 허용하면 가까운 이야기를 찾을 수 있어요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );
  }

  async function submitStory(event: FormEvent) {
    event.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    const id = youtubeId(form.youtube);
    if (!id) {
      setSubmitError("올바른 YouTube 링크를 입력해주세요.");
      setSubmitting(false);
      return;
    }
    const payload = {
      place: form.place,
      title: form.title,
      story: form.story,
      nickname,
      youtube_id: id,
      youtube_url: form.youtube,
      latitude: draftPoint.lat,
      longitude: draftPoint.lng,
      quiz_answer: quizAnswer,
    };

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 503 && demoMode) {
          const localStory: Story = {
            ...payload,
            id: `local-${Date.now()}`,
            color: "#2f276d",
          };
          setStories((current) => [localStory, ...current]);
          setSelectedId(localStory.id);
          setNotice(
            "샘플 모드에서 이 기기에만 저장했습니다. Supabase 연결 후에는 모두에게 공개됩니다.",
          );
        } else {
          throw new Error(data.error || "사연을 저장하지 못했습니다.");
        }
      } else {
        setStories((current) => [data.story as Story, ...current]);
        setSelectedId((data.story as Story).id);
        setNotice("새 이야기가 지도에 바로 공개됐어요.");
      }
      localStorage.setItem("yonsei-nickname", nickname);
      setForm({
        place: "내가 고른 자리",
        title: "",
        story: "",
        youtube: "",
      });
      setMode("explore");
      setPanelOpen(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "사연을 저장하지 못했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="연세의 소리 홈">
          <span className="brand-mark">Y</span>
          <span>
            <strong>연세의 소리</strong>
            <small>YONSEI SOUND MAP</small>
          </span>
        </a>
        <nav className="mode-switch" aria-label="서비스 모드">
          <button
            className={mode === "explore" ? "active" : ""}
            onClick={() => enterMode("explore")}
          >
            <span>⌖</span> 탐험 모드
          </button>
          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => enterMode("create")}
          >
            <span>＋</span> 제공자 모드
          </button>
        </nav>
        <div className="profile">
          <span className="profile-dot">{nickname?.[0] || "ㅇ"}</span>
          <span>{nickname || "방문자"}</span>
        </div>
      </header>

      <section className="map-stage real-map-stage">
        <YonseiMap
          stories={stories}
          selectedId={selectedId}
          mode={mode}
          draftPoint={draftPoint}
          userPosition={userPosition}
          onSelect={selectStory}
          onDraftPoint={updateDraftPoint}
        />

        <div className="map-status">
          <span className={demoMode ? "status-dot demo" : "status-dot"} />
          {demoMode ? "샘플 데이터 모드" : "실시간 공용 지도"}
        </div>
        <button className="location-button" onClick={locateMe}>
          <span className={locating ? "spin" : ""}>⌖</span>
          {locating ? "위치 찾는 중" : "내 위치"}
        </button>

        {mode === "explore" ? (
          <aside className={`story-panel ${panelOpen ? "open" : ""}`}>
            <button
              className="panel-close"
              onClick={() => setPanelOpen(false)}
              aria-label="이야기 닫기"
            >
              ×
            </button>
            {loading ? (
              <div className="panel-loading">캠퍼스의 이야기를 불러오는 중…</div>
            ) : selected ? (
              <>
                <div className="eyebrow">
                  <span className="live-dot" /> 지금 이곳의 이야기
                </div>
                <p className="place-name">⌖ {selected.place}</p>
                <h1>{selected.title}</h1>
                <p className="story-copy">{selected.story}</p>
                <div className="author-row">
                  <span className="avatar">{selected.nickname[0]}</span>
                  <span>
                    <small>남긴 사람</small>
                    <strong>{selected.nickname}</strong>
                  </span>
                </div>
                <div className="player">
                  <iframe
                    key={selected.youtube_id}
                    src={`https://www.youtube-nocookie.com/embed/${selected.youtube_id}?playsinline=1`}
                    title={`${selected.title}의 노래`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="discovery-row">
                  <span>발견한 이야기</span>
                  <strong>
                    {discovered.length} / {stories.length}
                  </strong>
                </div>
                <div className="progress">
                  <i
                    style={{
                      width: `${
                        stories.length
                          ? Math.min(
                              100,
                              (discovered.length / stories.length) * 100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <p className="location-note">{notice}</p>
              </>
            ) : (
              <div className="panel-loading">아직 등록된 이야기가 없어요.</div>
            )}
          </aside>
        ) : (
          <aside className="story-panel create-panel open">
            <div className="eyebrow">
              <span className="live-dot purple" /> 새로운 이야기 남기기
            </div>
            <h1>이 자리에 어떤 기억이 있나요?</h1>
            <p className="create-help">
              실제 지도를 눌러 핀을 놓고, 그곳에 어울리는 노래와 이야기를
              들려주세요.
            </p>
            <form onSubmit={submitStory}>
              <label>
                닉네임
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="예: 느린산책"
                  maxLength={20}
                  required
                />
              </label>
              <label>
                장소 이름
                <input
                  value={form.place}
                  onChange={(event) =>
                    setForm({ ...form, place: event.target.value })
                  }
                  maxLength={40}
                  required
                />
              </label>
              <label>
                사연 제목
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="한 문장으로 기억을 붙여주세요"
                  maxLength={60}
                  required
                />
              </label>
              <label>
                이야기
                <textarea
                  value={form.story}
                  onChange={(event) =>
                    setForm({ ...form, story: event.target.value })
                  }
                  placeholder="그날의 공기와 마음을 들려주세요"
                  maxLength={500}
                  required
                />
              </label>
              <label>
                YouTube 링크
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(event) =>
                    setForm({ ...form, youtube: event.target.value })
                  }
                  placeholder="https://youtu.be/..."
                  required
                />
              </label>
              <div className="coordinate-readout">
                <span>선택한 위치</span>
                <strong>
                  {draftPoint.lat.toFixed(5)}, {draftPoint.lng.toFixed(5)}
                </strong>
              </div>
              {submitError && <p className="form-error">{submitError}</p>}
              <button
                className="submit-story"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "공개하는 중…" : "지도에 바로 공개하기"}
              </button>
            </form>
          </aside>
        )}

        {!panelOpen && mode === "explore" && (
          <button className="reopen-panel" onClick={() => setPanelOpen(true)}>
            선택한 이야기 보기
          </button>
        )}
      </section>

      <div className="mobile-bar">
        <button
          className={mode === "explore" ? "active" : ""}
          onClick={() => enterMode("explore")}
        >
          <span>⌖</span>탐험
        </button>
        <button className="mobile-locate" onClick={locateMe}>
          ◎
        </button>
        <button
          className={mode === "create" ? "active" : ""}
          onClick={() => enterMode("create")}
        >
          <span>＋</span>기록
        </button>
      </div>

      {quizOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="quiz-card">
            <button
              className="modal-close"
              onClick={() => setQuizOpen(false)}
              aria-label="닫기"
            >
              ×
            </button>
            <div className="quiz-badge">YONSEI CHECK</div>
            <h2>연세를 아는 당신에게</h2>
            <p>
              연세대학교의 시작이 된 광혜원이 설립된 해는 언제일까요?
            </p>
            <div className="quiz-options">
              {quizOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => answerQuiz(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {quizError && (
              <p className="quiz-error">
                아쉬워요! 캠퍼스의 역사를 한 번 더 떠올려보세요.
              </p>
            )}
            <small>퀴즈 답은 사연 등록 시 서버에서도 다시 확인합니다.</small>
          </div>
        </div>
      )}
    </main>
  );
}
