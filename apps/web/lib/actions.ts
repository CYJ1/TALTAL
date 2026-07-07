'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { API_BASE_URL, DEMO_USER_ID, IS_REMOTE_MODE } from './config';
import { createPartyRequest, joinPartyRequest, submitReview } from './data';
import { getSessionUser, SESSION_COOKIE } from './session';
import type { CreateReviewInput, NewPartyInput } from './types';

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

export interface SignupInput {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

async function setSessionCookie(accessToken: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7일 (API 쪽 JWT 만료값과 동일하게 유지)
  });
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
