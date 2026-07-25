"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Mode = "explore" | "create";
type Pin = {
  id: string;
  x: number;
  y: number;
  place: string;
  title: string;
  story: string;
  nickname: string;
  youtubeId: string;
  color: string;
};

const seedPins: Pin[] = [
  {
    id: "seed-1",
    x: 49,
    y: 31,
    place: "언더우드관 앞",
    title: "처음 서울에 온 날",
    story:
      "첫 수업을 찾아 헤매다 이곳에서 한참 지도를 봤어요. 낯설었던 캠퍼스가 조금씩 내 자리가 되어가던 봄의 기억입니다.",
    nickname: "파란새",
    youtubeId: "V9PVRfjEBTI",
    color: "#ff6b4a",
  },
  {
    id: "seed-2",
    x: 66,
    y: 53,
    place: "백양로",
    title: "괜히 천천히 걷던 밤",
    story:
      "시험이 끝난 늦은 밤, 친구와 아무 말 없이 백양로를 걸었어요. 끝났다는 안도감과 졸업이 다가온다는 아쉬움이 같이 있었습니다.",
    nickname: "느린산책",
    youtubeId: "SlPhMPnQ58k",
    color: "#6550d8",
  },
  {
    id: "seed-3",
    x: 30,
    y: 67,
    place: "청송대",
    title: "비밀 아지트의 여름",
    story:
      "복잡한 날이면 여기로 도망왔어요. 나무 사이로 들어오던 오후 햇빛과 이어폰 속 이 노래를 함께 남깁니다.",
    nickname: "여름숲",
    youtubeId: "hLQl3WQQoQ0",
    color: "#178a64",
  },
  {
    id: "seed-4",
    x: 79,
    y: 72,
    place: "학생회관",
    title: "우리의 첫 합주",
    story:
      "박자를 계속 놓쳤지만 아무도 집에 가자고 하지 않았던 날. 서툴러서 더 선명하게 기억나는 우리의 첫 합주입니다.",
    nickname: "네번째현",
    youtubeId: "kJQP7kiw5Fk",
    color: "#e5a52a",
  },
];

const quizOptions = ["1885년", "1905년", "1946년"];
const colors = ["#ff6b4a", "#6550d8", "#178a64", "#e5a52a"];

function extractYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/,
  );
  return match?.[1] ?? "";
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("explore");
  const [pins, setPins] = useState<Pin[]>(seedPins);
  const [selectedId, setSelectedId] = useState(seedPins[0].id);
  const [panelOpen, setPanelOpen] = useState(true);
  const [quizOpen, setQuizOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [quizError, setQuizError] = useState(false);
  const [nickname, setNickname] = useState("");
  const [draftPoint, setDraftPoint] = useState({ x: 56, y: 45 });
  const [discovered, setDiscovered] = useState<string[]>(["seed-1"]);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState(
    "현재 위치를 켜고 캠퍼스의 이야기를 발견해보세요.",
  );
  const [form, setForm] = useState({
    title: "",
    story: "",
    youtube: "",
    place: "내가 고른 자리",
  });

  useEffect(() => {
    const savedPins = localStorage.getItem("yonsei-curation-pins");
    const savedDiscoveries = localStorage.getItem("yonsei-curation-discovered");
    const savedNickname = localStorage.getItem("yonsei-curation-nickname");
    if (savedPins) setPins([...seedPins, ...JSON.parse(savedPins)]);
    if (savedDiscoveries) setDiscovered(JSON.parse(savedDiscoveries));
    if (savedNickname) {
      setNickname(savedNickname);
      setVerified(true);
    }
  }, []);

  const selected = useMemo(
    () => pins.find((pin) => pin.id === selectedId) ?? pins[0],
    [pins, selectedId],
  );

  function chooseMode(next: Mode) {
    if (next === "create" && !verified) {
      setQuizOpen(true);
      return;
    }
    setMode(next);
    setPanelOpen(true);
  }

  function verifyQuiz(answer: string) {
    if (answer === "1885년") {
      setQuizError(false);
      setQuizOpen(false);
      setVerified(true);
      setMode("create");
    } else {
      setQuizError(true);
    }
  }

  function selectPin(pin: Pin) {
    setSelectedId(pin.id);
    setPanelOpen(true);
    if (!discovered.includes(pin.id)) {
      const next = [...discovered, pin.id];
      setDiscovered(next);
      localStorage.setItem("yonsei-curation-discovered", JSON.stringify(next));
    }
  }

  function locateMe() {
    setLocating(true);
    if (!navigator.geolocation) {
      setLocationMessage("이 브라우저는 위치 기능을 지원하지 않아요.");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const distance =
          Math.abs(position.coords.latitude - 37.5658) +
          Math.abs(position.coords.longitude - 126.9386);
        setLocationMessage(
          distance < 0.03
            ? "신촌캠퍼스에 도착했어요. 가까운 이야기 3개가 열렸습니다."
            : "현재 캠퍼스 밖이에요. 발견했던 이야기는 계속 들을 수 있어요.",
        );
        setDiscovered(pins.map((pin) => pin.id));
        setLocating(false);
      },
      () => {
        setLocationMessage(
          "위치 권한을 허용하면 가까운 이야기를 자동으로 알려드려요.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  function submitPin(event: FormEvent) {
    event.preventDefault();
    const youtubeId = extractYoutubeId(form.youtube);
    if (!youtubeId || !form.title.trim() || !form.story.trim()) return;
    const cleanNickname = nickname.trim() || "익명의 독수리";
    const nextPin: Pin = {
      id: `pin-${Date.now()}`,
      x: draftPoint.x,
      y: draftPoint.y,
      place: form.place || "신촌캠퍼스",
      title: form.title,
      story: form.story,
      nickname: cleanNickname,
      youtubeId,
      color: colors[pins.length % colors.length],
    };
    const userPins = [...pins.filter((pin) => !pin.id.startsWith("seed-")), nextPin];
    localStorage.setItem("yonsei-curation-pins", JSON.stringify(userPins));
    localStorage.setItem("yonsei-curation-nickname", cleanNickname);
    setNickname(cleanNickname);
    setPins([...pins, nextPin]);
    setSelectedId(nextPin.id);
    setMode("explore");
    setPanelOpen(true);
    setForm({ title: "", story: "", youtube: "", place: "내가 고른 자리" });
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
            onClick={() => chooseMode("explore")}
          >
            <span>⌖</span> 탐험 모드
          </button>
          <button
            className={mode === "create" ? "active" : ""}
            onClick={() => chooseMode("create")}
          >
            <span>＋</span> 제공자 모드
          </button>
        </nav>
        <div className="profile">
          <span className="profile-dot">{nickname ? nickname[0] : "ㅇ"}</span>
          <span>{nickname || "방문자"}</span>
        </div>
      </header>

      <section className="map-stage">
        <div className="map-grain" />
        <div className="campus-boundary" />
        <div className="road road-a" />
        <div className="road road-b" />
        <div className="road road-c" />
        <div className="pond" />
        <span className="pond-label">청송대 연못</span>
        <div className="building underwood">
          <i />
          <span>언더우드관</span>
        </div>
        <div className="building library">
          <i />
          <span>중앙도서관</span>
        </div>
        <div className="building student">
          <i />
          <span>학생회관</span>
        </div>
        <div className="building engineering">
          <i />
          <span>공학관</span>
        </div>
        <div className="building auditorium">
          <i />
          <span>대강당</span>
        </div>
        <span className="map-label baekyang">백 양 로</span>
        <span className="map-label yonsei">연세대학교 신촌캠퍼스</span>

        {pins.map((pin) => (
          <button
            key={pin.id}
            className={`map-pin ${selectedId === pin.id ? "selected" : ""}`}
            style={
              {
                left: `${pin.x}%`,
                top: `${pin.y}%`,
                "--pin-color": pin.color,
              } as React.CSSProperties
            }
            onClick={() => selectPin(pin)}
            aria-label={`${pin.title}, ${pin.place}`}
          >
            <span>♫</span>
          </button>
        ))}

        {mode === "create" && (
          <button
            className="draft-pin"
            style={{ left: `${draftPoint.x}%`, top: `${draftPoint.y}%` }}
            aria-label="새 핀 위치"
          >
            <span>＋</span>
          </button>
        )}

        <div className="map-tools">
          <button aria-label="확대">＋</button>
          <button aria-label="축소">−</button>
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
                key={selected.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?playsinline=1`}
                title={`${selected.title}의 노래`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="discovery-row">
              <span>발견한 이야기</span>
              <strong>
                {discovered.length} / {pins.length}
              </strong>
            </div>
            <div className="progress">
              <i
                style={{
                  width: `${Math.min(100, (discovered.length / pins.length) * 100)}%`,
                }}
              />
            </div>
            <p className="location-note">{locationMessage}</p>
          </aside>
        ) : (
          <aside className="story-panel create-panel open">
            <div className="eyebrow">
              <span className="live-dot purple" /> 새로운 이야기 남기기
            </div>
            <h1>이 자리에 어떤 기억이 있나요?</h1>
            <p className="create-help">
              지도를 눌러 핀을 옮긴 뒤, 그곳에 어울리는 노래와 이야기를
              들려주세요.
            </p>
            <form onSubmit={submitPin}>
              <label>
                닉네임
                <input
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="예: 느린산책"
                  maxLength={12}
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
                  maxLength={24}
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
                  maxLength={40}
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
                  maxLength={300}
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
              <div className="point-picker">
                <span>핀 위치 미세 조정</span>
                <div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftPoint({
                        ...draftPoint,
                        x: Math.max(8, draftPoint.x - 5),
                      })
                    }
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftPoint({
                        ...draftPoint,
                        y: Math.max(10, draftPoint.y - 5),
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftPoint({
                        ...draftPoint,
                        y: Math.min(85, draftPoint.y + 5),
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDraftPoint({
                        ...draftPoint,
                        x: Math.min(92, draftPoint.x + 5),
                      })
                    }
                  >
                    →
                  </button>
                </div>
              </div>
              <button className="submit-story" type="submit">
                지도에 바로 공개하기
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
          onClick={() => chooseMode("explore")}
        >
          <span>⌖</span>탐험
        </button>
        <button className="mobile-locate" onClick={locateMe}>
          ◎
        </button>
        <button
          className={mode === "create" ? "active" : ""}
          onClick={() => chooseMode("create")}
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
                <button key={option} onClick={() => verifyQuiz(option)}>
                  {option}
                </button>
              ))}
            </div>
            {quizError && (
              <p className="quiz-error">
                아쉬워요! 캠퍼스의 역사를 한 번 더 떠올려보세요.
              </p>
            )}
            <small>간단한 연세 퀴즈를 통과하면 바로 기록할 수 있어요.</small>
          </div>
        </div>
      )}
    </main>
  );
}
