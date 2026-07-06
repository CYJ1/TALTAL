import { API_BASE_URL, IS_REMOTE_MODE } from './config';
import * as mock from './mock-data';
import type {
  CalendarEntry,
  CreateReviewInput,
  HexagonStat,
  PartyDetail,
  RecommendationResponse,
  ThemeSearchResult,
  UserProfile,
} from './types';

/**
 * 이 파일은 화면(app/**)이 실제로 호출하는 유일한 데이터 레이어다.
 * API_BASE_URL이 설정된 "실연동 모드"에서는 apps/api(NestJS)의 REST 계약을
 * 그대로 호출해 응답 필드명을 프론트 타입(camelCase)으로 정규화하고,
 * 그렇지 않은 기본 "목업 모드"에서는 lib/mock-data.ts의 인메모리 픽스처를
 * 바로 반환한다. 두 모드 모두 화면 컴포넌트 코드는 동일하게 유지된다.
 */

async function remoteJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, cache: 'no-store' });
  if (!res.ok) throw new Error(`API ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

// 실제 NestJS/AI엔진 응답은 카멜/스네이크가 섞여 있을 수 있어(파이썬 FastAPI 쪽)
// 정규화 이전 단계에서는 느슨한 레코드 타입으로 받는다.
type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export async function searchThemes(query: {
  region?: string;
  tag?: string;
  availableOnly?: boolean;
}): Promise<ThemeSearchResult[]> {
  if (!IS_REMOTE_MODE) return mock.getThemesForSearch(query);

  const params = new URLSearchParams();
  if (query.region) params.set('region', query.region);
  if (query.tag) params.set('preferenceTag', query.tag);
  if (query.availableOnly) params.set('availableOnly', 'true');

  const raw = await remoteJson<Json[]>(`/search?${params.toString()}`);
  return raw.map((r) => ({
    themeId: r.themeId,
    storeId: r.storeId,
    storeName: r.storeName,
    themeName: r.themeName,
    rating: r.rating,
    tags: r.tags,
    capacityMin: r.capacityMin,
    capacityMax: r.capacityMax,
    slots: r.slots ?? [],
    recommendedHeadcount: r.recommendedHeadcount
      ? {
          recommended: r.recommendedHeadcount.recommended,
          reason: r.recommendedHeadcount.reason,
          sampleSize: r.recommendedHeadcount.sample_size ?? r.recommendedHeadcount.sampleSize ?? 0,
        }
      : null,
    cacheStatus: r.cacheStatus,
  }));
}

export async function getThemeMeta(
  themeId: string,
): Promise<{ themeId: string; themeName: string; storeName: string } | null> {
  if (!IS_REMOTE_MODE) {
    const t = mock.getThemeById(themeId);
    return t ? { themeId: t.themeId, themeName: t.themeName, storeName: t.storeName } : null;
  }
  const all = await searchThemes({});
  const found = all.find((t) => t.themeId === themeId);
  return found ? { themeId: found.themeId, themeName: found.themeName, storeName: found.storeName } : null;
}

export async function getProfile(userId: string): Promise<UserProfile> {
  if (!IS_REMOTE_MODE) return mock.getUserProfile(userId);
  return remoteJson<UserProfile>(`/users/${userId}/profile`);
}

export async function getCalendar(userId: string, month: string): Promise<CalendarEntry[]> {
  if (!IS_REMOTE_MODE) return mock.getUserCalendar(userId, month);
  const raw = await remoteJson<Json[]>(`/users/${userId}/calendar?month=${month}`);
  return raw.map((e) => ({
    id: e.id,
    date: e.date,
    themeId: e.themeId,
    themeName: e.themeName,
    status: e.status,
  }));
}

export async function getRecommendations(userId: string): Promise<RecommendationResponse> {
  if (!IS_REMOTE_MODE) return mock.getRecommendations(userId);

  const raw = await remoteJson<Json>(`/recommendations/${userId}`);
  return {
    userId: raw.user_id ?? raw.userId,
    peerSampleSize: raw.peer_sample_size ?? raw.peerSampleSize,
    items: (raw.items ?? []).map((i: Json) => ({
      themeId: i.theme_id ?? i.themeId,
      themeName: i.theme_name ?? i.themeName,
      storeName: i.store_name ?? i.storeName,
      tags: i.tags,
      matchScore: i.match_score ?? i.matchScore,
      recommendedHeadcount: i.recommended_headcount ?? i.recommendedHeadcount,
      capacityMin: i.capacity_min ?? i.capacityMin,
      capacityMax: i.capacity_max ?? i.capacityMax,
      reason: i.reason,
    })),
  };
}

export async function getPartyDetail(partyId: string): Promise<PartyDetail | null> {
  if (!IS_REMOTE_MODE) return mock.getPartyDetail(partyId);

  try {
    const raw = await remoteJson<Json>(`/parties/${partyId}`);
    return {
      id: raw.id,
      themeName: raw.theme?.name ?? '',
      storeName: raw.theme?.store?.name ?? '',
      reservedAt: raw.reservedAt,
      capacity: raw.capacity,
      totalPriceWon: raw.totalPriceWon,
      status: raw.status,
      verifiedBookingOk: raw.verifiedBookingOk,
      hostUserId: raw.hostUserId,
      participants: (raw.participants ?? []).map((p: Json) => ({
        id: p.id,
        userId: p.userId,
        nickname: p.user?.nickname ?? p.userId,
        mannerTemp: p.user?.mannerTemp ?? 36.5,
        stat: p.user?.stat
          ? ({
              logic: p.user.stat.logic,
              observe: p.user.stat.observe,
              speed: p.user.stat.speed,
              story: p.user.stat.story,
              solving: p.user.stat.solving,
              tank: p.user.stat.tank,
            } satisfies HexagonStat)
          : null,
        depositWon: p.depositWon,
        escrowStatus: p.escrowStatus,
      })),
    };
  } catch {
    return null;
  }
}

export async function submitReview(input: CreateReviewInput) {
  if (!IS_REMOTE_MODE) return mock.createReview(input);
  return remoteJson(`/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function joinPartyRequest(partyId: string, userId: string) {
  if (!IS_REMOTE_MODE) return mock.joinParty(partyId, userId);
  return remoteJson(`/parties/${partyId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
}
