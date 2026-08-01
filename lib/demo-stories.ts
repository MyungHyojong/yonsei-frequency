import type { Story } from "./types";

export const CAMPUS_CENTER = { lat: 37.5658, lng: 126.9386 };

export const CAMPUS_BOUNDS = {
  south: 37.5585,
  west: 126.928,
  north: 37.572,
  east: 126.947,
};

type DemoSeed = Omit<Story, "id" | "color" | "password">;

const seeds: DemoSeed[] = [
  {
    latitude: 37.56582, longitude: 126.93852, place: "언더우드관 앞", title: "중도 어디냐고 세 번 물어본 날",
    story: "새내기 때 지도 봐도 중도가 어딘지 모르겠어서 여기서 지나가는 사람 세 명한테 연달아 물어봤다. 다들 친절하게 알려줬는데 긴장해서 또 반대로 감. 지금은 후배가 길 물어보면 괜히 더 자세히 알려주게 된다.",
    nickname: "길치독수리", youtube_id: "D1PvIWdJ8xo", emotion: "설렘",
  },
  {
    latitude: 37.56558, longitude: 126.93872, place: "백양로 중앙", title: "공강 한 시간의 정석",
    story: "다음 수업까지 한 시간 남으면 애매해서 그냥 백양로를 왔다 갔다 했다. 친구 만나면 수업 가기 싫다고 10분 떠들고, 결국 출석 때문에 뛰어감. 별거 아닌데 그 시간이 제일 대학생 같았다.",
    nickname: "공강러", youtube_id: "pSUydWEqKwE", emotion: "고요",
  },
  {
    latitude: 37.56738, longitude: 126.93574, place: "청송대 벤치", title: "팀플 단톡 잠깐 끄고",
    story: "팀플 단톡 알림이 계속 와서 핸드폰을 뒤집어 놓고 여기 앉아 있었다. 20분만 아무것도 안 하니까 좀 살 것 같았음. 결국 다시 들어가서 피피티 다 만들긴 했지만.",
    nickname: "팀플탈주범", youtube_id: "5iSlfF8TQ9k", emotion: "위로",
  },
  {
    latitude: 37.56295, longitude: 126.93494, place: "학생회관 앞", title: "첫 동아리 뒤풀이",
    story: "이름도 잘 모르는 사람들이랑 학생회관 앞에서 모여 신촌으로 내려갔다. 어색해서 물만 마시다가 같은 과 선배를 발견하고 그때부터 말이 터졌다. 그날 친해진 애들이랑 아직도 학기마다 한 번은 만난다.",
    nickname: "민트초코", youtube_id: "vnS_jn2uibs", emotion: "기쁨",
  },
  {
    latitude: 37.56488, longitude: 126.93692, place: "중앙도서관 계단", title: "시험기간 새벽 두 시",
    story: "공부는 안 되고 카페인은 너무 많이 마셔서 친구랑 계단에 앉아 멍 때렸다. 서로 이번 학기 망했다고 했는데 성적 나오고 보니 둘 다 생각보단 괜찮았음. 매번 망했다면서 또 중도에 온다.",
    nickname: "중도지박령", youtube_id: "BzYnNdJhZQw", emotion: "고요",
  },
  {
    latitude: 37.56185, longitude: 126.93658, place: "대강당 뒤편", title: "고백은 못 하고 노래만 보냄",
    story: "수업 끝나고 같이 걷다가 좋아하는 노래 있냐는 얘기가 나왔다. 집에 가서 플레이리스트 링크만 보냈는데 사실 거의 고백이었다. 상대는 몰랐던 것 같고 나만 한동안 답장 기다림.",
    nickname: "읽씹아님", youtube_id: "ulr0muQKjk0", emotion: "설렘",
  },
  {
    latitude: 37.56673, longitude: 126.93938, place: "연희관 복도", title: "발표 망하고 매점 감",
    story: "교수님 질문에 아무 말도 못 해서 발표 끝나자마자 얼굴이 빨개졌다. 같이 발표한 친구가 괜찮다고 매점에서 초코우유 사줌. 지금 생각하면 발표 내용은 하나도 기억 안 나고 그 초코우유만 기억난다.",
    nickname: "질문금지", youtube_id: "5iSlfF8TQ9k", emotion: "위로",
  },
  {
    latitude: 37.56416, longitude: 126.93896, place: "백양누리 광장", title: "비 오는 날 우산 하나",
    story: "갑자기 비가 와서 과 동기랑 우산 하나 쓰고 정문까지 내려갔다. 둘 다 어깨 반씩 젖었는데 괜히 웃겼다. 그 뒤로 친해졌고 지금은 비 오면 먼저 우산 있냐고 물어보는 사이.",
    nickname: "반쪽우산", youtube_id: "D1PvIWdJ8xo", emotion: "설렘",
  },
  {
    latitude: 37.56818, longitude: 126.93822, place: "공학원 옥외 계단", title: "코드가 안 돌아가던 밤",
    story: "세 시간째 같은 에러만 떠서 노트북을 진짜 덮어버리고 싶었다. 옆자리 선배가 지나가다 괄호 하나 빠졌다고 알려줌. 허무해서 웃었는데 실행 성공 뜨는 순간만큼은 세상을 다 가진 기분이었다.",
    nickname: "세미콜론", youtube_id: "vnS_jn2uibs", emotion: "열정",
  },
  {
    latitude: 37.56062, longitude: 126.93685, place: "정문 앞 횡단보도", title: "휴학 끝나고 첫 등교",
    story: "복학 첫날이라 아는 사람이 하나도 없을까 봐 괜히 일찍 왔다. 정문 건너는데 학교가 익숙하면서도 좀 남의 학교 같았다. 첫 수업에서 예전 동기 만나자마자 긴장이 풀림.",
    nickname: "복학생1", youtube_id: "xEeFrLSkMm8", emotion: "설렘",
  },
  {
    latitude: 37.56348, longitude: 126.93641, place: "백양관 1층", title: "수강신청 올클한 사람 봄",
    story: "친구가 수강신청 올클했다길래 백양관에서 시간표를 구경했다. 나는 전공 하나 놓쳐서 교수님께 메일 쓰고 있었음. 부럽다고 했더니 친구도 결국 한 과목 드랍했다.",
    nickname: "대기번호7", youtube_id: "GdoNGNe5CSg", emotion: "그리움",
  },
  {
    latitude: 37.56515, longitude: 126.93582, place: "노천극장", title: "아카라카 다음 날 목소리",
    story: "응원가를 너무 크게 불러서 다음 날 말이 거의 안 나왔다. 그래도 영상 돌려보면서 또 따라 부름. 그때는 체력도 좋았고 다음 날 9시 수업도 갔다니 지금은 못 할 일이다.",
    nickname: "목쉰독수리", youtube_id: "vnS_jn2uibs", emotion: "열정",
  },
  {
    latitude: 37.56602, longitude: 126.93731, place: "연세삼성학술정보관", title: "자리 맡아두고 밥 먹으러",
    story: "시험기간에 겨우 자리 잡고 친구랑 밥만 빨리 먹고 오자고 했다. 그런데 신촌까지 내려갔다가 디저트까지 먹고 두 시간 뒤에 돌아옴. 책상 위 노트가 그대로라 다행이면서도 좀 양심 찔렸다.",
    nickname: "자리만공부", youtube_id: "BzYnNdJhZQw", emotion: "기쁨",
  },
  {
    latitude: 37.56534, longitude: 126.94012, place: "교육과학관 앞", title: "첫 과외비 받은 날",
    story: "수업 끝나고 첫 과외비가 들어왔다는 문자를 여기서 봤다. 바로 친구 불러서 학식 말고 신촌에서 밥 샀음. 통장은 다시 가벼워졌지만 그날은 내가 진짜 어른 된 것 같았다.",
    nickname: "월급하루", youtube_id: "D1PvIWdJ8xo", emotion: "기쁨",
  },
  {
    latitude: 37.56702, longitude: 126.93643, place: "청송대 입구", title: "CC 헤어진 다음 주",
    story: "헤어지고 나니까 학교 어디를 가도 한 번씩 같이 갔던 곳이었다. 일부러 청송대를 피해 다니다가 어느 날 그냥 혼자 걸었다. 생각보다 괜찮았고 그 뒤로는 다시 내 산책로가 됐다.",
    nickname: "솔로복귀", youtube_id: "m3DZsBw5bnE", emotion: "그리움",
  },
  {
    latitude: 37.56372, longitude: 126.93815, place: "백양누리 푸드코트", title: "점심 메뉴 20분 회의",
    story: "다섯 명이 모이면 먹고 싶은 게 다 달라서 메뉴 정하는 데만 20분 걸렸다. 결국 각자 먹고 싶은 거 사서 푸드코트에서 만남. 왜 진작 이렇게 안 했는지 모르겠지만 다음 주에도 또 메뉴 회의했다.",
    nickname: "메뉴결정장애", youtube_id: "pSUydWEqKwE", emotion: "기쁨",
  },
  {
    latitude: 37.56451, longitude: 126.93488, place: "학생회관 동아리방", title: "축제 전날 밤샘",
    story: "축제 부스 준비가 안 끝나서 동아리방에서 다 같이 밤을 샜다. 새벽 네 시쯤 되니까 다들 이상하게 텐션이 올라서 현수막 글씨도 삐뚤빼뚤해짐. 부스는 정신없었지만 그 준비 날이 더 재밌었다.",
    nickname: "테이프담당", youtube_id: "vnS_jn2uibs", emotion: "열정",
  },
  {
    latitude: 37.56904, longitude: 126.93874, place: "과학관 앞", title: "실험 결과가 또 이상함",
    story: "분명 매뉴얼대로 했는데 우리 조만 결과가 이상하게 나왔다. 조교님께 물어보니 다음 주에 다시 하라고 해서 다 같이 한숨 쉼. 그래도 재실험 날에는 손이 빨라져서 제시간에 끝났다.",
    nickname: "오차범위밖", youtube_id: "K72ZxP9ZAP4", emotion: "위로",
  },
  {
    latitude: 37.56268, longitude: 126.93754, place: "글로벌라운지", title: "교환학생 친구랑 첫 약속",
    story: "수업 조별활동에서 만난 친구랑 글로벌라운지에서 커피 마셨다. 영어가 막혀서 번역기를 몇 번 켰는데도 두 시간 넘게 얘기함. 학기 끝나고 돌아간 뒤에도 가끔 서로 학교 사진을 보낸다.",
    nickname: "번역기친구", youtube_id: "D1PvIWdJ8xo", emotion: "설렘",
  },
  {
    latitude: 37.56591, longitude: 126.93963, place: "외솔관 계단", title: "전공 바꿀까 고민하던 때",
    story: "수업이 너무 안 맞아서 전공을 바꿀지 한 달 내내 고민했다. 여기 앉아서 선배한테 전화했는데 일단 이번 학기까지만 해보라고 했다. 결국 바꾸진 않았고 지금도 가끔 그 선택이 맞았는지는 모르겠다.",
    nickname: "진로미정", youtube_id: "5iSlfF8TQ9k", emotion: "고요",
  },
  {
    latitude: 37.56645, longitude: 126.93885, place: "연희관 앞 벤치", title: "교수님 메일 답장 기다리기",
    story: "과제 제출 시간을 착각해서 교수님께 장문의 메일을 보냈다. 답장 올 때까지 새로고침만 계속했는데 다행히 이번만 받아주신다고 했다. 그 뒤로 마감 시간은 캘린더에 두 번 적는다.",
    nickname: "메일제목죄송", youtube_id: "BzYnNdJhZQw", emotion: "위로",
  },
  {
    latitude: 37.56191, longitude: 126.93452, place: "체육관 앞", title: "농구 교양 마지막 경기",
    story: "한 학기 내내 슛이 안 들어갔는데 마지막 경기에서 딱 한 번 들어갔다. 팀원들이 우승한 것처럼 소리 질러줘서 좀 민망하면서도 좋았음. 성적은 무난했지만 그 한 골은 아직 기억난다.",
    nickname: "한골전문", youtube_id: "vnS_jn2uibs", emotion: "기쁨",
  },
  {
    latitude: 37.56472, longitude: 126.93944, place: "상경대 앞", title: "첫 대면 시험 끝",
    story: "온라인 시험만 보다가 처음 강의실에서 시험을 봤다. 끝나자마자 다들 답 맞춰보다가 분위기만 더 안 좋아짐. 그냥 덮고 떡볶이 먹으러 가자는 친구가 제일 현명했다.",
    nickname: "답안지봉인", youtube_id: "pSUydWEqKwE", emotion: "기쁨",
  },
  {
    latitude: 37.56841, longitude: 126.93686, place: "제2공학관 연결통로", title: "과제 제출 1분 전",
    story: "와이파이가 갑자기 느려져서 제출 버튼 누르고 로딩 화면만 보고 있었다. 11시 59분에 완료 뜨자마자 친구랑 소리 없이 하이파이브함. 다시 하라면 미리 할 것 같지만 아마 또 똑같을 듯.",
    nickname: "2359", youtube_id: "vnS_jn2uibs", emotion: "열정",
  },
  {
    latitude: 37.56096, longitude: 126.93812, place: "정문 경비실 근처", title: "막차 놓치고 학교로 돌아옴",
    story: "신촌에서 막차를 놓쳐서 갈 데가 없어 다시 정문으로 올라왔다. 친구랑 24시간 카페 찾다가 결국 첫차까지 얘기했다. 당시엔 피곤했는데 지금은 그 밤 얘기를 제일 자주 한다.",
    nickname: "첫차대기", youtube_id: "ulr0muQKjk0", emotion: "그리움",
  },
  {
    latitude: 37.56771, longitude: 126.93491, place: "청송대 안쪽 길", title: "혼자 걷는 게 필요했던 날",
    story: "사람 만나는 것도 수업 듣는 것도 다 귀찮은 날이었다. 이어폰 끼고 청송대 한 바퀴 돌고 나니 딱히 해결된 건 없지만 짜증은 좀 가라앉았다. 가끔은 대화보다 산책이 빠르다.",
    nickname: "말걸지마", youtube_id: "BzYnNdJhZQw", emotion: "고요",
  },
  {
    latitude: 37.56327, longitude: 126.93567, place: "학생회관 식당", title: "학식 마지막 천 원",
    story: "통장에 진짜 얼마 안 남았는데 학식은 먹어야 해서 동전을 다 털었다. 옆에서 친구가 반찬 하나 더 받아와서 나눠줌. 다음 달 용돈 들어오자마자 그 친구 밥부터 샀다.",
    nickname: "잔액부족", youtube_id: "5iSlfF8TQ9k", emotion: "위로",
  },
  {
    latitude: 37.56549, longitude: 126.93783, place: "언더우드 동상 옆", title: "졸업사진 찍던 날",
    story: "사진 찍을 때는 다들 학사모 던지는 타이밍이 안 맞아서 계속 다시 찍었다. 웃느라 제대로 나온 사진은 별로 없는데 오히려 그게 마음에 든다. 끝나고 짜장면 먹으면서도 아직 졸업이 실감 안 났다.",
    nickname: "학사모분실", youtube_id: "GdoNGNe5CSg", emotion: "그리움",
  },
  {
    latitude: 37.56402, longitude: 126.94003, place: "대우관 앞", title: "처음 받은 A+ 문자",
    story: "성적 확인하고 잘못 본 줄 알고 로그아웃했다가 다시 들어갔다. 친구한테 캡처 보내니까 네가 웬일이냐고 답장 옴. 그 과목 때문에 전공이 아주 싫지만은 않게 됐다.",
    nickname: "새로고침3번", youtube_id: "D1PvIWdJ8xo", emotion: "기쁨",
  },
  {
    latitude: 37.56696, longitude: 126.94021, place: "위당관 앞", title: "휴강 공지 너무 늦게 봄",
    story: "강의실 앞까지 와서야 휴강 공지를 확인했다. 처음엔 억울했는데 갑자기 두 시간이 생겨서 친구랑 커피 마시러 감. 그날 이후 학교 오는 길에는 공지부터 확인한다.",
    nickname: "공지미확인", youtube_id: "pSUydWEqKwE", emotion: "기쁨",
  },
];

export const demoStories: Story[] = seeds.map((story, index) => ({
  ...story,
  id: `seed-${index + 1}`,
  color: "#8dbbe8",
  password: "3141",
}));
