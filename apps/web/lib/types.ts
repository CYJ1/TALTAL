export interface TimeSlot {
  time: string;
  status: 'AVAILABLE' | 'FEW_LEFT' | 'CLOSED';
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
  rating: number;
  tags: string[];
  capacityMin: number;
  capacityMax: number;
  slots: TimeSlot[];
  recommendedHeadcount: RecommendedHeadcount | null;
  cacheStatus: 'HIT' | 'REFRESHING';
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
}
