"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { YonseiMap } from "@/components/YonseiMap";
import { CAMPUS_CENTER, demoStories } from "@/lib/demo-stories";
import type { Emotion, Story } from "@/lib/types";

type Mode = "explore" | "create";
type LatLng = { lat: number; lng: number };
type LocationMethod = "pin" | "current";

const emotionOptions: Array<{ key: Emotion; color: string; icon: string }> = [
  { key: "설렘", color: "#ff9fbd", icon: "♡" },
  { key: "그리움", color: "#a99bdd", icon: "◐" },
  { key: "위로", color: "#82cfc7", icon: "≈" },
  { key: "기쁨", color: "#f4c95d", icon: "✦" },
  { key: "고요", color: "#8dbbe8", icon: "○" },
  { key: "열정", color: "#f07b6a", icon: "↟" },
];
const emotionColor = Object.fromEntries(
  emotionOptions.map(({ key, color }) => [key, color]),
) as Record<Emotion, string>;
const baseStories = demoStories.map((story, index) => ({
  ...story,
  emotion: emotionOptions[index % emotionOptions.length].key,
  color: emotionOptions[index % emotionOptions.length].color,
}));

function parseYouTubeId(url: string) {
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
  const [stories, setStories] = useState<Story[]>(baseStories);
  const [selectedId, setSelectedId] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [verified, setVerified] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [draftPoint, setDraftPoint] = useState<LatLng>(CAMPUS_CENTER);
  const [locationMethod, setLocationMethod] = useState<LocationMethod>("pin");
  const [userPosition, setUserPosition] = useState<LatLng>();
  const [testPositionEnabled, setTestPositionEnabled] = useState(false);
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState(
    "GPS를 활성화하고 캠퍼스의 숨겨진 주파수를 탐색하세요.",
  );
  const [formError, setFormError] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState({
    place: "신촌캠퍼스의 어느 곳",
    title: "",
    story: "",
    youtube: "",
    password: "",
    emotion: "설렘" as Emotion,
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const localStories = JSON.parse(
          localStorage.getItem("yonsei-neon-stories") || "[]",
        ) as Story[];
        const savedDiscovered = JSON.parse(
          localStorage.getItem("yonsei-gps-discovered") || "[]",
        ) as string[];
        const hiddenStoryIds = JSON.parse(
          localStorage.getItem("yonsei-hidden-stories") || "[]",
        ) as string[];
        const normalizedLocalStories = localStories.map((story) => ({
          ...story,
          password: story.password || "3141",
          emotion: story.emotion || ("고요" as Emotion),
          color: story.emotion ? emotionColor[story.emotion] : story.color,
        }));
        const hiddenSet = new Set(hiddenStoryIds);
        const nextStories = [...normalizedLocalStories, ...baseStories].filter(
          (story) => !hiddenSet.has(story.id),
        );
        const validStoryIds = new Set(nextStories.map((story) => story.id));
        const validDiscovered = savedDiscovered.filter((id) => validStoryIds.has(id));
        setStories(nextStories);
        setDiscovered(validDiscovered);
        localStorage.setItem("yonsei-gps-discovered", JSON.stringify(validDiscovered));
        const savedNickname = localStorage.getItem("yonsei-neon-nickname") || "";
        setNickname(savedNickname);
        setNicknameDraft(savedNickname);
        setNicknameOpen(!savedNickname);
        setDarkMode(localStorage.getItem("yonsei-frequency-theme") === "dark");
      } catch {
        localStorage.removeItem("yonsei-neon-stories");
        localStorage.removeItem("yonsei-gps-discovered");
        setNicknameOpen(true);
      }
    });
  }, []);

  function saveNickname(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNickname = nicknameDraft.trim();
    if (!nextNickname) return;
    setNickname(nextNickname);
    localStorage.setItem("yonsei-neon-nickname", nextNickname);
    setNicknameOpen(false);
  }

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("yonsei-frequency-theme", next ? "dark" : "light");
  }

  const selected = useMemo(
    () => stories.find((story) => story.id === selectedId),
    [stories, selectedId],
  );

  const nearbyStories = useMemo(
    () =>
      userPosition
        ? stories.filter(
            (story) =>
              distanceMeters(userPosition, {
                lat: story.latitude,
                lng: story.longitude,
              }) <= 50,
          )
        : [],
    [stories, userPosition],
  );
  const collectionPercent = stories.length
    ? Math.round((discovered.length / stories.length) * 100)
    : 0;

  const selectStory = useCallback((story: Story) => {
    setSelectedId(story.id);
    setPanelOpen(true);
    setDeleteOpen(false);
    setDeletePassword("");
    setDeleteError("");
  }, []);

  function deleteSelectedStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    if (deletePassword !== selected.password) {
      setDeleteError("비밀번호가 맞지 않습니다.");
      return;
    }

    const nextStories = stories.filter((story) => story.id !== selected.id);
    setStories(nextStories);
    setSelectedId("");
    setPanelOpen(false);
    setDeleteOpen(false);
    setDeletePassword("");
    setDeleteError("");

    if (selected.id.startsWith("local-")) {
      const localStories = nextStories.filter((story) => story.id.startsWith("local-"));
      localStorage.setItem("yonsei-neon-stories", JSON.stringify(localStories));
    } else {
      const hiddenStoryIds = JSON.parse(
        localStorage.getItem("yonsei-hidden-stories") || "[]",
      ) as string[];
      localStorage.setItem(
        "yonsei-hidden-stories",
        JSON.stringify(Array.from(new Set([...hiddenStoryIds, selected.id]))),
      );
    }

    setDiscovered((current) => {
      const next = current.filter((id) => id !== selected.id);
      localStorage.setItem("yonsei-gps-discovered", JSON.stringify(next));
      return next;
    });
    setNotice("사연이 이 기기의 지도에서 삭제됐습니다.");
  }

  const updateDraftPoint = useCallback((point: LatLng) => {
    setDraftPoint(point);
    setLocationMethod("pin");
  }, []);

  function enterMode(nextMode: Mode) {
    if (nextMode === "create" && !verified) {
      setQuizOpen(true);
      return;
    }
    setMode(nextMode);
    if (nextMode === "explore") {
      setSelectedId("");
      setPanelOpen(false);
    } else {
      setTestPositionEnabled(false);
      setPanelOpen(true);
    }
  }

  function answerQuiz(answer: string) {
    if (answer !== "1885") {
      setQuizError(true);
      return;
    }
    setVerified(true);
    setQuizError(false);
    setQuizOpen(false);
    setMode("create");
    setTestPositionEnabled(false);
    setPanelOpen(true);
  }

  const saveDiscoveries = useCallback((ids: string[]) => {
    setDiscovered((current) => {
      const next = Array.from(new Set([...current, ...ids]));
      localStorage.setItem("yonsei-gps-discovered", JSON.stringify(next));
      return next;
    });
  }, []);

  const updateTestPosition = useCallback((position: LatLng) => {
    const nearby = stories.filter(
      (story) =>
        distanceMeters(position, {
          lat: story.latitude,
          lng: story.longitude,
        }) <= 50,
    );
    setUserPosition(position);
    setNotice(`테스트 마커 위치에서 ${nearby.length}개의 사연 신호를 찾았습니다.`);
    setSelectedId("");
    setPanelOpen(false);
  }, [stories]);

  function simulateCampusPosition() {
    if (testPositionEnabled) {
      setTestPositionEnabled(false);
      setUserPosition(undefined);
      setSelectedId("");
      setPanelOpen(false);
      setNotice("수동 위치 변경을 종료했습니다.");
      return;
    }
    setTestPositionEnabled(true);
    updateTestPosition(CAMPUS_CENTER);
    setNotice("지도 위 테스트 마커를 마우스로 잡아 원하는 위치로 이동하세요.");
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setNotice("이 브라우저에서는 GPS를 사용할 수 없습니다.");
      return;
    }
    setLocating(true);
    setTestPositionEnabled(false);
    setNotice("위성 신호를 탐색하는 중…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        const nearby = stories.filter(
          (story) =>
            distanceMeters(position, {
              lat: story.latitude,
              lng: story.longitude,
            }) <= 50,
        );
        setUserPosition(position);
        saveDiscoveries(nearby.map((story) => story.id));
        setNotice(
          nearby.length
            ? `반경 50m에서 ${nearby.length}개의 주파수를 포착했습니다.`
            : "반경 50m 안에 등록된 주파수가 없습니다.",
        );
        setSelectedId("");
        setPanelOpen(false);
        setLocating(false);
      },
      () => {
        setNotice("브라우저에서 위치 권한을 허용해주세요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );
  }

  function useCurrentLocationForStory() {
    setLocationMethod("current");
    if (!navigator.geolocation) {
      setFormError("이 브라우저에서는 현재 위치를 사용할 수 없습니다.");
      return;
    }
    setLocating(true);
    setFormError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude };
        setDraftPoint(position);
        setUserPosition(position);
        setTestPositionEnabled(false);
        setNotice("현재 위치를 사연 장소로 설정했습니다.");
        setLocating(false);
      },
      () => {
        setFormError("현재 위치를 가져오지 못했습니다. 위치 권한을 확인해주세요.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 },
    );
  }

  function submitStory(event: FormEvent) {
    event.preventDefault();
    setFormError("");
    const id = parseYouTubeId(form.youtube);
    if (!id) {
      setFormError("올바른 YouTube 링크를 입력해주세요.");
      return;
    }

    const newStory: Story = {
      id: `local-${Date.now()}`,
      place: form.place.trim(),
      title: form.title.trim(),
      story: form.story.trim(),
      nickname: nickname.trim(),
      youtube_id: id,
      latitude: draftPoint.lat,
      longitude: draftPoint.lng,
      password: form.password,
      emotion: form.emotion,
      color: emotionColor[form.emotion],
      created_at: new Date().toISOString(),
    };
    const localStories = [
      newStory,
      ...stories.filter((story) => story.id.startsWith("local-")),
    ];
    localStorage.setItem("yonsei-neon-stories", JSON.stringify(localStories));
    localStorage.setItem("yonsei-neon-nickname", nickname.trim());
    setStories([newStory, ...stories]);
    setSelectedId(newStory.id);
    setNotice("새로운 주파수가 이 기기의 지도에 저장됐습니다.");
    setForm({
      place: "신촌캠퍼스의 어느 곳",
      title: "",
      story: "",
      youtube: "",
      password: "",
      emotion: "설렘",
    });
    setMode("explore");
    setPanelOpen(true);
  }

  return (
    <main className="app-shell" data-theme={darkMode ? "dark" : "light"}>
      <header className="topbar">
        <a className="brand" href="#" aria-label="연세 주파수 홈">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img">
              <path d="M7 25h5l3-9 5 18 4-25 5 30 5-21 3 7h5" />
            </svg>
          </span>
          <strong>YONSEI FREQUENCY</strong>
        </a>
        <nav className="mode-switch" aria-label="서비스 모드">
          <button
            className={mode === "explore" ? "active" : ""}
            onClick={() => enterMode("explore")}
          >
            <span>⌁</span> 탐험하기
          </button>
          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => enterMode("create")}
          >
            <span>＋</span> 사연 남기기
          </button>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}>
            {darkMode ? "☀" : "☾"}
          </button>
          <button
            className="profile"
            onClick={() => {
              setNicknameDraft(nickname);
              setNicknameOpen(true);
            }}
            aria-label="닉네임 변경"
          >
            <span className="profile-dot">{nickname?.[0] || "Y"}</span>
            <span>{nickname || "SET NAME"}</span>
          </button>
        </div>
      </header>

      <section className="map-stage real-map-stage">
        <YonseiMap
          stories={stories}
          selectedId={selectedId}
          mode={mode}
          draftPoint={draftPoint}
          userPosition={userPosition}
          testPositionEnabled={testPositionEnabled}
          onSelect={selectStory}
          onDraftPoint={updateDraftPoint}
          onTestPosition={updateTestPosition}
        />
        <div className="map-vignette" />
        <div className="scan-line" />

        <div className="map-status">
          <span className="status-dot" /> 신촌 캠퍼스 · ONLINE
        </div>
        <div className="collection-hud" aria-label={`사연 수집률 ${collectionPercent}%`}>
          <div
            className="collection-ring"
            style={{ "--collection-progress": `${collectionPercent * 3.6}deg` } as React.CSSProperties}
          >
            <strong>{collectionPercent}%</strong>
          </div>
          <span>
            <small>나의 주파수 도감</small>
            <b>{discovered.length} / {stories.length} 발견</b>
          </span>
        </div>
        <button className="location-button" onClick={locateMe}>
          <span className={locating ? "spin" : ""}>⌖</span>
          {locating ? "위치 찾는 중" : "내 위치 찾기"}
        </button>
        <button
          className={`demo-location-button ${testPositionEnabled ? "active" : ""}`}
          onClick={simulateCampusPosition}
          aria-pressed={testPositionEnabled}
        >
          <span className="manual-toggle" aria-hidden="true"><i /></span>
          수동 위치 변경
          <b>{testPositionEnabled ? "ON" : "OFF"}</b>
        </button>

        {mode === "explore" && nearbyStories.length > 0 && (
          <div className="signal-dock" aria-label="범위 안에서 발견된 사연">
            <span className="signal-dock-label">NEARBY</span>
            {nearbyStories.map((story, index) => (
              <button
                key={story.id}
                className={selectedId === story.id ? "active" : ""}
                style={{ "--signal-color": story.color } as React.CSSProperties}
                onClick={() => selectStory(story)}
                aria-label={`${story.place}: ${story.title}`}
                title={story.title}
              >
                <i />
                <small>{index + 1}</small>
              </button>
            ))}
          </div>
        )}

        {mode === "explore" ? (
          <aside className={`story-panel ${panelOpen ? "open" : ""}`}>
            <button
              className="panel-close"
              onClick={() => setPanelOpen(false)}
              aria-label="이야기 닫기"
            >
              ×
            </button>
            {selected ? (
              <>
                <div className="eyebrow">
                  <span className="live-dot" /> SIGNAL FOUND · {selected.id.slice(-4)}
                </div>
                {selected.emotion && (
                  <span
                    className="emotion-chip"
                    style={{ "--emotion-color": selected.color } as React.CSSProperties}
                  >
                    {emotionOptions.find((emotion) => emotion.key === selected.emotion)?.icon} {selected.emotion}
                  </span>
                )}
                <p className="place-name">⌖ {selected.place}</p>
                <h1>{selected.title}</h1>
                <p className="story-copy">{selected.story}</p>
                <div className="author-row">
                  <span className="avatar">{selected.nickname[0]}</span>
                  <span>
                    <small>TRANSMITTED BY</small>
                    <strong>{selected.nickname}</strong>
                  </span>
                </div>
                <div className="player">
                  <iframe
                    key={selected.youtube_id}
                    src={`https://www.youtube.com/embed/${selected.youtube_id}?feature=oembed&playsinline=1&rel=0`}
                    title={`${selected.title}의 노래`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
                <a
                  className="youtube-fallback"
                  href={`https://www.youtube.com/watch?v=${selected.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  재생이 막히면 YouTube에서 듣기 ↗
                </a>
                <div className="story-delete-area">
                  {!deleteOpen ? (
                    <button
                      type="button"
                      className="story-delete-toggle"
                      onClick={() => {
                        setDeleteOpen(true);
                        setDeleteError("");
                      }}
                    >
                      이 사연 삭제하기
                    </button>
                  ) : (
                    <form className="story-delete-form" onSubmit={deleteSelectedStory}>
                      <label>
                        삭제 비밀번호
                        <input
                          type="password"
                          value={deletePassword}
                          onChange={(event) => setDeletePassword(event.target.value)}
                          placeholder="등록할 때 설정한 비밀번호"
                          autoComplete="off"
                          required
                        />
                      </label>
                      {deleteError && <p>{deleteError}</p>}
                      <div>
                        <button type="button" onClick={() => setDeleteOpen(false)}>취소</button>
                        <button type="submit">삭제</button>
                      </div>
                    </form>
                  )}
                </div>
                <div className="discovery-row">
                  <span>CAPTURED SIGNALS</span>
                  <strong>
                    {discovered.length.toString().padStart(2, "0")} / {stories.length}
                  </strong>
                </div>
                <div className="progress">
                  <i
                    style={{
                      width: `${stories.length ? Math.min(100, (discovered.length / stories.length) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="location-note">{notice}</p>
              </>
            ) : (
              <div className="panel-loading">NO SIGNAL</div>
            )}
          </aside>
        ) : (
          <aside className="story-panel create-panel open">
            <div className="eyebrow">
              <span className="live-dot magenta" /> NEW TRANSMISSION
            </div>
            <h1>이 장소에 기억을 송신하세요.</h1>
            <p className="create-help">
              지도를 클릭하거나 지도 위 핀을 직접 끌어 장소를 정한 뒤, 노래와 사연을 남겨주세요.
            </p>
            <form onSubmit={submitStory}>
              <fieldset className="location-method-fieldset">
                <legend>PLACE METHOD · 장소 선택</legend>
                <div className="location-method-options">
                  <button
                    type="button"
                    className={locationMethod === "pin" ? "active" : ""}
                    onClick={() => setLocationMethod("pin")}
                  >
                    <span>⌖</span>
                    <b>직접 찍기</b>
                    <small>지도 클릭 또는 핀 이동</small>
                  </button>
                  <button
                    type="button"
                    className={locationMethod === "current" ? "active" : ""}
                    onClick={useCurrentLocationForStory}
                  >
                    <span>◎</span>
                    <b>{locating ? "찾는 중…" : "현 위치"}</b>
                    <small>GPS 위치로 바로 지정</small>
                  </button>
                </div>
              </fieldset>
              <label>
                CALL SIGN · 닉네임
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="예: NIGHTWALKER"
                  maxLength={20}
                  required
                />
              </label>
              <label>
                LOCATION · 장소
                <input
                  value={form.place}
                  onChange={(event) => setForm({ ...form, place: event.target.value })}
                  maxLength={40}
                  required
                />
              </label>
              <label>
                SUBJECT · 제목
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="기억에 이름을 붙여주세요"
                  maxLength={60}
                  required
                />
              </label>
              <fieldset className="emotion-fieldset">
                <legend>MOOD · 이 사연의 감정</legend>
                <div className="emotion-options">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion.key}
                      type="button"
                      className={form.emotion === emotion.key ? "active" : ""}
                      style={{ "--emotion-color": emotion.color } as React.CSSProperties}
                      onClick={() => setForm({ ...form, emotion: emotion.key })}
                      aria-pressed={form.emotion === emotion.key}
                    >
                      <i>{emotion.icon}</i>
                      {emotion.key}
                    </button>
                  ))}
                </div>
                <small>선택한 감정 색으로 지도 핀과 신호 아이콘이 표시됩니다.</small>
              </fieldset>
              <label>
                MESSAGE · 이야기
                <textarea
                  value={form.story}
                  onChange={(event) => setForm({ ...form, story: event.target.value })}
                  placeholder="그날의 공기와 마음을 들려주세요"
                  maxLength={500}
                  required
                />
              </label>
              <label>
                AUDIO SOURCE · YouTube
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(event) => setForm({ ...form, youtube: event.target.value })}
                  placeholder="https://youtu.be/..."
                  required
                />
              </label>
              <label>
                DELETE PASSWORD · 삭제 비밀번호
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="나중에 이 사연을 삭제할 때 사용합니다"
                  minLength={4}
                  maxLength={20}
                  autoComplete="new-password"
                  required
                />
              </label>
              <div className="coordinate-readout">
                <span>TARGET COORDINATES</span>
                <strong>
                  {draftPoint.lat.toFixed(5)}, {draftPoint.lng.toFixed(5)}
                </strong>
              </div>
              {formError && <p className="form-error">{formError}</p>}
              <button className="submit-story" type="submit">
                TRANSMIT TO LOCAL MAP ↗
              </button>
            </form>
          </aside>
        )}

        {!panelOpen && mode === "explore" && selected && (
          <button className="reopen-panel" onClick={() => setPanelOpen(true)}>
            OPEN SIGNAL
          </button>
        )}
      </section>

      <div className="mobile-bar">
        <button
          className={mode === "explore" ? "active" : ""}
          onClick={() => enterMode("explore")}
        >
          <span>◎</span>SCAN
        </button>
        <button className="mobile-locate" onClick={locateMe}>⌖</button>
        <button
          className={mode === "create" ? "active" : ""}
          onClick={() => enterMode("create")}
        >
          <span>＋</span>DROP
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
            <div className="quiz-badge">ACCESS CHECK</div>
            <h2>연세 주파수 인증</h2>
            <p>연세대학교의 시작이 된 광혜원이 설립된 해는 언제일까요?</p>
            <div className="quiz-options">
              {[
                ["1885년", "1885"],
                ["1905년", "1905"],
                ["1946년", "1946"],
              ].map(([label, value]) => (
                <button key={value} onClick={() => answerQuiz(value)}>
                  {label}
                </button>
              ))}
            </div>
            {quizError && <p className="quiz-error">ACCESS DENIED · 다시 시도해주세요.</p>}
            <small>간이 인증 후 이 기기의 지도에 사연을 남길 수 있습니다.</small>
          </div>
        </div>
      )}

      {nicknameOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="nickname-title">
          <form className="quiz-card nickname-card" onSubmit={saveNickname}>
            {nickname && (
              <button className="modal-close" type="button" onClick={() => setNicknameOpen(false)} aria-label="닫기">
                ×
              </button>
            )}
            <div className="nickname-wave" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </div>
            <div className="quiz-badge">TUNE IN</div>
            <h2 id="nickname-title">당신의 주파수 이름</h2>
            <p>지도에서 사용할 닉네임을 정해주세요. 언제든 오른쪽 위 프로필에서 바꿀 수 있어요.</p>
            <input
              className="nickname-input"
              value={nicknameDraft}
              onChange={(event) => setNicknameDraft(event.target.value)}
              placeholder="예: 파란새, 밤산책"
              maxLength={20}
              autoFocus
              required
            />
            <button className="nickname-submit" type="submit">주파수 입장하기</button>
          </form>
        </div>
      )}
    </main>
  );
}
