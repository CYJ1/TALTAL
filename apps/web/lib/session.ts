import { cookies } from 'next/headers';
import { cache } from 'react';
import { API_BASE_URL, DEMO_USER_ID, IS_REMOTE_MODE } from './config';

export const SESSION_COOKIE = 'taltal_session';

export interface SessionUser {
  id: string;
  email: string;
  nickname: string;
}

// 요청(RSC 렌더 트리) 단위로 /auth/me 호출을 한 번만 하도록 캐시한다.
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // cookies()는 항상(분기 이전에) 호출해야 한다 — Next.js는 이 호출이 실제로
  // 실행되는 것을 보고 라우트를 동적 렌더링으로 표시한다. API_BASE_URL이 build
  // 시점(Docker 이미지 빌드)에는 비어 있고 런타임(docker-compose)에만 채워지는
  // 이 프로젝트 구조상, 이 분기 뒤에 호출하면 목업 모드로 빌드될 때 이 라우트가
  // 정적 페이지로 미리 렌더링되어 실제 로그인 세션이 영원히 무시되는 문제가 있었다.
  await cookies();

  if (!IS_REMOTE_MODE) {
    return { id: DEMO_USER_ID, email: 'demo@taltal.demo', nickname: '방탈출고인물' };
  }

  const token = await getSessionToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as SessionUser;
  } catch {
    return null;
  }
});

export async function getSessionToken(): Promise<string | null> {
  if (!IS_REMOTE_MODE) return null;
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

export async function setSessionCookie(accessToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일 (API 쪽 JWT 만료값과 동일하게 유지)
  });
}
