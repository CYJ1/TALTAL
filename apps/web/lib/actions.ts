'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL, DEMO_USER_ID, IS_REMOTE_MODE } from './config';
import { createPartyRequest, joinPartyRequest, searchThemes, submitReview } from './data';
import { getSessionToken, getSessionUser, SESSION_COOKIE, setSessionCookie } from './session';
import type { CreateReviewInput, NewPartyInput, SignupPreferences } from './types';

export async function submitReviewAction(input: Omit<CreateReviewInput, 'userId'>) {
  const userId = (await getSessionUser())?.id ?? DEMO_USER_ID;
  const result = await submitReview({ ...input, userId });
  revalidatePath('/calendar');
  revalidatePath('/home');
  return result;
}

export async function joinPartyAction(partyId: string) {
  const userId = (await getSessionUser())?.id ?? DEMO_USER_ID;
  const result = await joinPartyRequest(partyId, userId);
  revalidatePath(`/party/${partyId}`);
  return result;
}

export async function createPartyAction(input: Omit<NewPartyInput, 'hostUserId'>) {
  const userId = (await getSessionUser())?.id ?? DEMO_USER_ID;
  const { id } = await createPartyRequest({ ...input, hostUserId: userId });
  revalidatePath(`/party/${id}`);
  return { id };
}

export interface SignupInput extends SignupPreferences {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function signupAction(input: SignupInput) {
  if (!IS_REMOTE_MODE) {
    // 목업 모드: 실제 인증 서버 연동 없이 입력값만 검증하고 통과시킨다.
    return;
  }

  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? '회원가입에 실패했습니다.');
  }
  await setSessionCookie(body.accessToken);
}

export async function loginAction(input: LoginInput) {
  if (!IS_REMOTE_MODE) {
    // 목업 모드: 실제 인증 서버 연동 없이 입력값만 있으면 통과시킨다.
    return;
  }

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message ?? '이메일 또는 비밀번호가 올바르지 않습니다.');
  }
  await setSessionCookie(body.accessToken);
}

export async function logoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect('/login');
}

// 소셜 신규 가입 온보딩 화면에서 호출 — 이메일 가입 폼의 선호도 항목과 동일한 값을 받는다.
export async function updatePreferencesAction(input: SignupPreferences) {
  if (!IS_REMOTE_MODE) return;

  const token = await getSessionToken();
  const res = await fetch(`${API_BASE_URL}/auth/me/preferences`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? '선호도 저장에 실패했습니다.');
  }
  revalidatePath('/profile');
}

// 앱으로 예약 안 하고 플레이한 테마를 수동으로 기록할 때, 테마 검색창에서 호출.
export async function searchThemesForLogAction(q: string) {
  if (!q.trim()) return [];
  const results = await searchThemes({ q });
  return results.slice(0, 10);
}

export async function checkNicknameAvailableAction(nickname: string): Promise<boolean> {
  if (!IS_REMOTE_MODE) return true;

  const token = await getSessionToken();
  const res = await fetch(
    `${API_BASE_URL}/auth/me/nickname-available?nickname=${encodeURIComponent(nickname)}`,
    { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: 'no-store' },
  );
  if (!res.ok) return false;
  const body = await res.json();
  return Boolean(body.available);
}

export async function updateNicknameAction(nickname: string) {
  if (!IS_REMOTE_MODE) return;

  const token = await getSessionToken();
  const res = await fetch(`${API_BASE_URL}/auth/me/nickname`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ nickname }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? '닉네임 변경에 실패했습니다.');
  }
  revalidatePath('/profile');
}
