# Supabase + Google OAuth

이 프로젝트는 **Supabase Postgres**와 **Supabase Auth (Google OAuth)** 를 사용합니다.

## 스택

- **DB**: `public.profiles`, `public.pages` (RLS로 `owner_id = auth.uid()`)
- **인증**: `@supabase/ssr` 쿠키 세션 + Google OAuth
- **API**: Next.js Route Handlers (`/api/pages/*`, `/api/auth/me`, `/api/auth/logout`)

## 환경 변수

`.env.local` (또는 `.env`)에 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

## Google 로그인 설정

1. Supabase Dashboard → **Authentication** → **Providers** → Google 활성화
2. Google Cloud Console에서 OAuth 클라이언트 ID/Secret 등록
3. **Redirect URLs**에 추가:
   - `http://localhost:3000/auth/callback`
   - 배포 URL의 `/auth/callback`

## 주요 파일

| 역할 | 경로 |
|------|------|
| 브라우저 Supabase 클라이언트 | `lib/supabase/client.ts` |
| 서버 Supabase 클라이언트 | `lib/supabase/server.ts` |
| 세션 미들웨어 | `middleware.ts`, `lib/supabase/middleware.ts` |
| OAuth 콜백 | `app/auth/callback/route.ts` |
| 로그인 UI | `app/login/page.tsx` |
| 현재 사용자 | `lib/auth/require-user.ts` |
| 페이지 CRUD | `lib/repos/page-repo.ts` |

## `pages` 테이블 필드

| 컬럼 | 용도 |
|------|------|
| `blocks_json` | 에디터 블록 (jsonb) |
| `parent_id` | 사이드바 중첩 |
| `icon`, `cover_image` | 페이지 메타 |
| `deleted_at` | 소프트 삭제(휴지통) |

레거시 `content` 컬럼은 사용하지 않습니다.

## API 엔드포인트

- `GET /api/auth/me` — 현재 사용자
- `POST /api/auth/logout` — 로그아웃
- `GET/POST /api/pages` — 목록/생성
- `GET/PATCH/DELETE /api/pages/[id]` — 조회/수정/휴지통 이동
- `GET/DELETE /api/pages/trash` — 휴지통 목록/비우기
