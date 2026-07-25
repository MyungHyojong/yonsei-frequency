# 연세의 소리

연세대학교 신촌캠퍼스의 장소에 노래와 사연을 남기고, 현장에서 GPS로
가까운 이야기를 발견하는 모바일 우선 사운드 맵입니다.

## 구성

- Next.js App Router
- Next.js Route Handler (`/api/stories`)
- Kakao Maps JavaScript API
- Supabase Postgres + PostGIS
- YouTube IFrame Player
- Vercel 배포

## 로컬 실행

```bash
npm install
copy .env.example .env.local
npm run dev
```

환경변수가 없을 때는 14개의 샘플 사연과 간이 지도가 표시됩니다.

## Kakao 지도 설정

1. Kakao Developers에서 애플리케이션을 생성합니다.
2. JavaScript 키를 `.env.local`의 `NEXT_PUBLIC_KAKAO_MAP_KEY`에 넣습니다.
3. JavaScript SDK 도메인에 `http://localhost:3000`과 Vercel 프로덕션
   도메인을 등록합니다.

## Supabase 설정

1. Supabase 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. 같은 화면에서 `supabase/seed.sql`을 실행해 샘플 사연 14개를 넣습니다.
3. Project URL을 `SUPABASE_URL`에 넣습니다.
4. 서버 전용 Service Role Key를 `SUPABASE_SERVICE_ROLE_KEY`에 넣습니다.
5. Service Role Key에는 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.

읽기는 RLS를 적용하고, 쓰기는 Next.js API에서 입력값·퀴즈 답·캠퍼스 좌표를
검증한 뒤 서버 전용 키로 처리합니다.

## Vercel 배포

Git 저장소를 Vercel에 연결하고 `.env.example`의 네 환경변수를 Project
Settings에 등록합니다. 빌드 명령은 `npm run build`이며 별도 서버는 필요하지
않습니다.

## 확인

```bash
npm run build
npm run lint
```
