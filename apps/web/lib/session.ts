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
