import type {
  CalendarEntry,
  CreateReviewInput,
  GenerationPreference,
  GenreTag,
  HexagonStat,
  HorrorRole,
  PacingPreference,
  PartyDetail,
  RecommendationResponse,
  ThemeSearchResult,
  TimeSlot,
  UserProfile,
} from './types';

/**
 * 목업 인메모리 데이터 스토어.
 * apps/api(Prisma)와 apps/scraper/apps/ai-engine의 시드 데이터와 동일한 ID 체계를
 * 사용해, 나중에 API_BASE_URL을 설정하면 동일한 화면이 실제 백엔드로도 그대로
 * 동작하도록 맞췄다. (개발 서버 프로세스 생명주기 동안만 유지되는 데모용 상태)
 */

interface ThemeSeed {
  themeId: string;
  storeId: string;
  storeName: string;
  themeName: string;
  region: string;
  rating: number;
  tags: string[];
  capacityMin: number;
  capacityMax: number;
  weight: HexagonStat;
  votes: Record<number, number>; // 실체감 인원수 투표 스냅샷
}

const THEMES: ThemeSeed[] = [
  {
    themeId: 'confession',
    storeId: 'keyescape-gangnam',
    storeName: '키이스케이프 강남점',
    themeName: '고백',
    region: '서울 강남구',
    rating: 4.8,
    tags: ['장치중심', '감성레전드', '나레이션필수'],
    capacityMin: 2,
    capacityMax: 5,
    weight: { logic: 2, observe: 3, speed: 1, story: 8, solving: 4, tank: 1 },
    votes: { 2: 4, 3: 21, 4: 6 },
  },
  {
    themeId: 'ring',
    storeId: 'zerooworld-gangnam',
    storeName: '제로월드 강남점',
    themeName: '링',
    region: '서울 강남구',
    rating: 4.7,
    tags: ['공포도최상', '탱커필수', '연출대박'],
    capacityMin: 2,
    capacityMax: 6,
    weight: { logic: 3, observe: 4, speed: 3, story: 2, solving: 3, tank: 9 },
    votes: { 3: 5, 4: 18, 5: 9 },
  },
  {
    themeId: 'yesterday-today',
    storeId: 'murderparker-gangnam',
    storeName: '머더파커 강남점',
    themeName: '어제, 오늘, 그리고',
    region: '서울 강남구',
    rating: 4.9,
    tags: ['문제방', '뚝배기유형', '활동성낮음'],
    capacityMin: 2,
    capacityMax: 4,
    weight: { logic: 8, observe: 5, speed: 1, story: 3, solving: 6, tank: 1 },
    votes: { 2: 14, 3: 3 },
  },
  {
    themeId: 'key-double-life',
    storeId: 'point9-gangnam',
    storeName: '포인트나인 강남점',
    themeName: '열쇠공의 이중생활',
    region: '서울 강남구',
    rating: 4.6,
    tags: ['잠입', '장치중심', '스토리연계성'],
    capacityMin: 2,
    capacityMax: 5,
    weight: { logic: 4, observe: 7, speed: 2, story: 5, solving: 5, tank: 2 },
    votes: { 2: 3, 3: 17, 4: 4 },
  },
];

const SLOT_TIMES = ['14:00', '15:30', '16:30', '18:00', '19:00', '19:40', '20:00', '21:15', '21:45'];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return h;
}

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 스크래퍼의 mock_source.py와 동일한 아이디어: 5분 버킷 시드로 재현 가능한 흔들림 부여 */
function generateSlots(themeId: string): TimeSlot[] {
  const bucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const rng = mulberry32(hashSeed(`${themeId}:${bucket}`));
  return SLOT_TIMES.map((time) => {
    const roll = rng();
    const status: TimeSlot['status'] = roll > 0.55 ? 'AVAILABLE' : roll > 0.4 ? 'FEW_LEFT' : 'CLOSED';
    return { time, status };
  });
}

function recommendedHeadcountFor(theme: ThemeSeed) {
  const entries = Object.entries(theme.votes).map(([n, v]) => [Number(n), v] as const);
  if (entries.length === 0) {
    const fallback = Math.round((theme.capacityMin + theme.capacityMax) / 2);
    return { recommended: fallback, reason: `매장 정원 기준 중간값 추천`, sampleSize: 0 };
  }
  const [bestN] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  const sampleSize = entries.reduce((sum, [, v]) => sum + v, 0);
  const reasonMap: Record<number, string> = {
    2: `공간 협소로 ${bestN}인 최적`,
    3: `공간 협소로 ${bestN}인 최적`,
    4: `탱1+딜${bestN - 1} 최적`,
  };
  const reason = reasonMap[bestN] ?? `스토리 집중형 ${bestN}인 최적`;
  return { recommended: bestN, reason: `집계 체감 추천인원: ${bestN}인 (${reason})`, sampleSize };
}

export function getThemesForSearch(query: {
  region?: string;
  tag?: string;
  availableOnly?: boolean;
}): ThemeSearchResult[] {
  let themes = THEMES;
  if (query.region) themes = themes.filter((t) => t.region === query.region);
  if (query.tag) themes = themes.filter((t) => t.tags.includes(query.tag!));

  const results = themes.map(mapThemeToSearchResult).sort((a, b) => b.rating - a.rating);

  if (query.availableOnly) {
    return results.filter((r) => r.slots.some((s) => s.status !== 'CLOSED'));
  }
  return results;
}

function mapThemeToSearchResult(theme: ThemeSeed): ThemeSearchResult {
  const slots = generateSlots(theme.themeId);
  const rh = recommendedHeadcountFor(theme);
  return {
    themeId: theme.themeId,
    storeId: theme.storeId,
    storeName: theme.storeName,
    themeName: theme.themeName,
    rating: theme.rating,
    tags: theme.tags,
    capacityMin: theme.capacityMin,
    capacityMax: theme.capacityMax,
    slots,
    recommendedHeadcount: { recommended: rh.recommended, reason: rh.reason, sampleSize: rh.sampleSize },
    cacheStatus: 'HIT' as const,
  };
}

export function getThemeById(themeId: string) {
  return THEMES.find((t) => t.themeId === themeId) ?? null;
}

export function getThemeDetail(themeId: string): ThemeSearchResult | null {
  const theme = THEMES.find((t) => t.themeId === themeId);
  return theme ? mapThemeToSearchResult(theme) : null;
}

// ---- 유저 / 스탯 / 캘린더 ----

interface UserRecord {
  userId: string;
  nickname: string;
  level: number;
  mannerTemp: number;
  totalClears: number;
  currentExp: number;
  isBeginner: boolean;
  genrePreferences: GenreTag[];
  pacingPreference: PacingPreference | null;
  generationPreference: GenerationPreference | null;
  horrorRole: HorrorRole | null;
  stat: HexagonStat;
}

const USERS: Record<string, UserRecord> = {
  escaper_pro: {
    userId: 'escaper_pro',
    nickname: '방탈출고인물',
    level: 42,
    mannerTemp: 98.2,
    totalClears: 148,
    currentExp: 84,
    isBeginner: false,
    genrePreferences: ['HORROR_THRILLER', 'ACTION_ADVENTURE'],
    pacingPreference: 'SPEED',
    generationPreference: 'GEN3',
    horrorRole: 'TANK',
    stat: { logic: 95, observe: 90, speed: 88, story: 72, solving: 76, tank: 98 },
  },
};

const CALENDAR: CalendarEntry[] = [
  { id: 'log-1', date: '2026-07-11', themeId: 'ring', themeName: '링', status: 'PENDING_REVIEW' },
  { id: 'log-2', date: '2026-07-12', themeId: 'confession', themeName: '고백', status: 'REVIEWED' },
];

export function getUserProfile(userId: string): UserProfile {
  const u = USERS[userId] ?? USERS.escaper_pro;
  return {
    userId: u.userId,
    nickname: u.nickname,
    level: u.level,
    mannerTemp: u.mannerTemp,
    totalClears: u.totalClears,
    expPercent: Math.min(100, Math.round((u.currentExp / 100) * 100)),
    isBeginner: u.isBeginner,
    genrePreferences: u.genrePreferences,
    pacingPreference: u.pacingPreference,
    generationPreference: u.generationPreference,
    horrorRole: u.horrorRole,
    stat: { ...u.stat },
  };
}

export function getUserCalendar(userId: string, month: string): CalendarEntry[] {
  return CALENDAR.filter((c) => c.date.startsWith(month));
}

function clampStat(v: number) {
  return Math.min(100, Math.max(0, v));
}

export function createReview(input: CreateReviewInput) {
  const theme = getThemeById(input.themeId);
  const user = USERS[input.userId] ?? USERS.escaper_pro;

  if (theme) {
    const clearBonus = input.cleared ? 1.2 : 0.4;
    const timeScore = Math.min(2, Math.max(0.5, input.remainingSec / 60 / 10));
    const gain = (w: number) => w * clearBonus * timeScore;
    user.stat = {
      logic: clampStat(user.stat.logic + gain(theme.weight.logic)),
      observe: clampStat(user.stat.observe + gain(theme.weight.observe)),
      speed: clampStat(user.stat.speed + gain(theme.weight.speed)),
      story: clampStat(user.stat.story + gain(theme.weight.story)),
      solving: clampStat(user.stat.solving + gain(theme.weight.solving)),
      tank: clampStat(user.stat.tank + gain(theme.weight.tank)),
    };
    user.totalClears += input.cleared ? 1 : 0;
    user.currentExp = Math.min(100, user.currentExp + 12);
  }

  const pendingEntry = CALENDAR.find(
    (c) => c.themeName === theme?.themeName && c.status === 'PENDING_REVIEW',
  );
  if (pendingEntry) pendingEntry.status = 'REVIEWED';

  return { ok: true, updatedStat: { ...user.stat } };
}

// ---- AI 추천 (Neo4j GraphSAGE 간이 대체 로직의 목업 버전) ----

export function getRecommendations(userId: string): RecommendationResponse {
  const profile = getUserProfile(userId);
  const weakestStat = (Object.entries(profile.stat) as [keyof HexagonStat, number][]).reduce((a, b) =>
    b[1] < a[1] ? b : a,
  )[0];

  const weakStatKo: Record<keyof HexagonStat, string> = {
    logic: '추리력',
    observe: '직관력',
    speed: '활동성',
    story: '스토리이해',
    solving: '문제해결',
    tank: '탱킹력',
  };

  const candidates = THEMES.filter((t) => t.themeId !== 'confession' && t.themeId !== 'ring');

  const items = candidates.map((theme) => {
    const rh = recommendedHeadcountFor(theme);
    const isStoryFocused = theme.tags.includes('스토리연계성');
    const matchScore = isStoryFocused ? 92.5 : 98.2;
    const reason = isStoryFocused
      ? `다차원 임베딩 공간에서 귀하의 취약 스탯 영역인 '${weakStatKo[weakestStat]}' 수치를 비약적으로 보정할 수 있는 최적의 시너지 테마입니다.`
      : `귀하가 최고 점수로 클리어한 테마와 그래프 위상 토폴로지 상 가장 촘촘한 코사인 유사도를 나타냅니다.`;

    return {
      themeId: theme.themeId,
      themeName: theme.themeName,
      storeName: theme.storeName,
      tags: theme.tags,
      matchScore,
      recommendedHeadcount: rh.recommended,
      capacityMin: theme.capacityMin,
      capacityMax: theme.capacityMax,
      reason,
    };
  });

  return { userId, peerSampleSize: 1500, items: items.sort((a, b) => b.matchScore - a.matchScore) };
}

// ---- 파티 / 에스크로 ----

interface ParticipantRecord {
  id: string;
  userId: string;
  depositWon: number;
  escrowStatus: 'HOLDING' | 'RELEASED' | 'FORFEITED';
}

interface PartyRecord {
  id: string;
  themeId: string;
  hostUserId: string;
  reservedAt: string;
  capacity: number;
  totalPriceWon: number;
  status: 'OPEN' | 'FILLED' | 'SETTLED' | 'DISPUTED';
  verifiedBookingOk: boolean;
  participants: ParticipantRecord[];
}

const PARTIES: Record<string, PartyRecord> = {
  'party-demo-1': {
    id: 'party-demo-1',
    themeId: 'confession',
    hostUserId: 'escaper_pro',
    reservedAt: '2026-07-12T19:40:00+09:00',
    capacity: 4,
    totalPriceWon: 112000,
    status: 'OPEN',
    verifiedBookingOk: true,
    participants: [
      { id: 'pp-1', userId: 'escaper_pro', depositWon: 28000, escrowStatus: 'HOLDING' },
      { id: 'pp-2', userId: 'user_b', depositWon: 28000, escrowStatus: 'HOLDING' },
    ],
  },
};

function otherUserProfile(userId: string): { nickname: string; mannerTemp: number; stat: HexagonStat | null } {
  if (userId === 'user_b') {
    return { nickname: '유저B', mannerTemp: 36.5, stat: { logic: 70, observe: 80, speed: 60, story: 65, solving: 55, tank: 40 } };
  }
  const p = getUserProfile(userId);
  return { nickname: p.nickname, mannerTemp: p.mannerTemp, stat: p.stat };
}

export function getPartyDetail(partyId: string): PartyDetail | null {
  const party = PARTIES[partyId];
  if (!party) return null;
  const theme = getThemeById(party.themeId);

  return {
    id: party.id,
    themeName: theme?.themeName ?? '알 수 없는 테마',
    storeName: theme?.storeName ?? '',
    reservedAt: party.reservedAt,
    capacity: party.capacity,
    totalPriceWon: party.totalPriceWon,
    status: party.status,
    verifiedBookingOk: party.verifiedBookingOk,
    hostUserId: party.hostUserId,
    participants: party.participants.map((p) => {
      const info = otherUserProfile(p.userId);
      return {
        id: p.id,
        userId: p.userId,
        nickname: info.nickname,
        mannerTemp: info.mannerTemp,
        stat: info.stat,
        depositWon: p.depositWon,
        escrowStatus: p.escrowStatus,
      };
    }),
  };
}

export function joinParty(partyId: string, userId: string) {
  const party = PARTIES[partyId];
  if (!party) throw new Error('party not found');
  if (party.participants.length >= party.capacity) throw new Error('party full');
  if (party.participants.some((p) => p.userId === userId)) throw new Error('already joined');

  const depositWon = Math.round(party.totalPriceWon / party.capacity);
  party.participants.push({
    id: `pp-${Date.now()}`,
    userId,
    depositWon,
    escrowStatus: 'HOLDING',
  });
  if (party.participants.length >= party.capacity) party.status = 'FILLED';

  return getPartyDetail(partyId)!;
}

/** [도메인 4] 사양 #1: OCR 검증(목업) 후 파티 개설 + 방장 본인의 보증금 즉시 홀딩 */
export function createParty(input: {
  themeId: string;
  hostUserId: string;
  reservedAt: string;
  capacity: number;
  totalPriceWon: number;
  bookingScreenshotBase64: string;
}): string {
  if (!input.bookingScreenshotBase64) {
    throw new Error('예약 캡처본 OCR 검증에 실패했습니다 (허위/리셀 룸 의심)');
  }

  const id = `party-${Date.now()}`;
  const depositWon = Math.round(input.totalPriceWon / input.capacity);

  PARTIES[id] = {
    id,
    themeId: input.themeId,
    hostUserId: input.hostUserId,
    reservedAt: input.reservedAt,
    capacity: input.capacity,
    totalPriceWon: input.totalPriceWon,
    status: 'OPEN',
    verifiedBookingOk: true,
    participants: [{ id: `pp-${Date.now()}`, userId: input.hostUserId, depositWon, escrowStatus: 'HOLDING' }],
  };

  return id;
}
