export interface TimeSlot {
  time: string;
  status: 'AVAILABLE' | 'FEW_LEFT' | 'CLOSED';
}

export interface DistrictFacet {
  district: string;
  neighborhoods: string[];
}

export interface DateSlots {
  date: string;
  slots: TimeSlot[];
  cacheStatus: 'HIT' | 'REFRESHING' | 'MOCK_ESTIMATE';
}

export interface RecommendedHeadcount {
  recommended: number;
  reason: string;
  sampleSize: number;
}

export interface ThemeSearchResult {
  themeId: string;
  storeId: string;
  storeName: string;
  themeName: string;
  genre: GenreTag;
  generation: GenerationPreference;
  difficulty: number;
  pricePerPersonWon: number;
  district: string;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  tags: string[];
  capacityMin: number;
  capacityMax: number;
  slots: TimeSlot[];
  recommendedHeadcount: RecommendedHeadcount | null;
  cacheStatus: 'HIT' | 'REFRESHING';
  distanceKm?: number | null;
}

export interface HexagonStat {
  logic: number;
  observe: number;
  speed: number;
  story: number;
  solving: number;
  tank: number;
}

export interface UserProfile {
  userId: string;
  nickname: string;
  level: number;
  mannerTemp: number;
  totalClears: number;
  expPercent: number;
  isBeginner: boolean;
  experienceTier: ExperienceTier | null;
  genrePreferences: GenreTag[];
  pacingPreference: PacingPreference | null;
  generationPreference: GenerationPreference | null;
  horrorRole: HorrorRole | null;
  stat: HexagonStat;
}

export interface CalendarEntry {
  id: string;
  date: string;
  themeId: string;
  themeName: string;
  status: 'PENDING_REVIEW' | 'REVIEWED' | 'MANUAL_ENTRY';
}

export interface RecommendedTheme {
  themeId: string;
  themeName: string;
  storeName: string;
  tags: string[];
  matchScore: number;
  recommendedHeadcount: number;
  capacityMin: number;
  capacityMax: number;
  reason: string;
}

export interface RecommendationResponse {
  userId: string;
  peerSampleSize: number;
  items: RecommendedTheme[];
  aiEngineAvailable: boolean;
}

export interface PartyParticipantView {
  id: string;
  userId: string;
  nickname: string;
  mannerTemp: number;
  stat: HexagonStat | null;
  depositWon: number;
  escrowStatus: 'HOLDING' | 'RELEASED' | 'FORFEITED';
}

export interface PartyDetail {
  id: string;
  themeName: string;
  storeName: string;
  reservedAt: string;
  capacity: number;
  totalPriceWon: number;
  status: 'OPEN' | 'FILLED' | 'SETTLED' | 'DISPUTED';
  verifiedBookingOk: boolean;
  hostUserId: string;
  participants: PartyParticipantView[];
}

export interface NewPartyInput {
  themeId: string;
  hostUserId: string;
  reservedAt: string;
  capacity: number;
  totalPriceWon: number;
  bookingScreenshotBase64: string;
}

export interface CreateReviewInput {
  themeId: string;
  userId: string;
  grade: string;
  selectedTags: string[];
  votedHeadcount: number;
  cleared: boolean;
  remainingSec: number;
  hintsUsed: number;
  comment?: string;
  // 앱 예약 없이 플레이한 테마를 수동으로 기록할 때만 채움 (YYYY-MM-DD).
  playedAt?: string;
}

export interface UserReview {
  id: string;
  themeId: string;
  themeName: string;
  storeName: string;
  grade: string;
  selectedTags: string[];
  votedHeadcount: number;
  cleared: boolean;
  remainingSec: number;
  hintsUsed: number;
  comment: string | null;
  createdAt: string;
}

// 가입 시 선호도 설문 (방린이면 종료, 아니면 장르/진행스타일/선호세대 + 공포 선택 시 역할)
// 장르는 한국 방탈출 어워즈 시상 부문 기준 6개 분류를 그대로 채택한다.
export type GenreTag =
  | 'HORROR_THRILLER'
  | 'EMOTIONAL_ROMANCE'
  | 'MYSTERY_DETECTIVE'
  | 'ACTION_ADVENTURE'
  | 'SCIFI_FANTASY'
  | 'COMEDY_ETC';
export type PacingPreference = 'STORY' | 'SPEED';
// 방탈출 세대: 1세대(자물쇠·퀴즈) / 2세대(장치·센서) / 3세대(이머시브·앱연동)
export type GenerationPreference = 'GEN1' | 'GEN2' | 'GEN3';
export type HorrorRole = 'SCARED' | 'PUSH_THROUGH' | 'TANK';
// 방린이가 아닐 때 누적 클리어 방수 구간
export type ExperienceTier = 'TIER_10' | 'TIER_50' | 'TIER_100' | 'TIER_100_PLUS';

export interface SignupPreferences {
  isBeginner: boolean;
  experienceTier?: ExperienceTier;
  genrePreferences?: GenreTag[];
  pacingPreference?: PacingPreference;
  generationPreference?: GenerationPreference;
  horrorRole?: HorrorRole;
}
