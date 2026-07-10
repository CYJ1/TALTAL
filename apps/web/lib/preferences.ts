import type { UserProfile } from './types';

const HORROR_ROLE_LABEL: Record<NonNullable<UserProfile['horrorRole']>, string> = {
  SCARED: '😱 쫄',
  PUSH_THROUGH: '😨 전진쫄',
  TANK: '💪 탱커',
};

const PACING_LABEL: Record<NonNullable<UserProfile['pacingPreference']>, string> = {
  STORY: '📖 스토리파',
  SPEED: '⚡ 스피드파',
};

const GENERATION_LABEL: Record<NonNullable<UserProfile['generationPreference']>, string> = {
  GEN1: '🔒 1세대파',
  GEN2: '⚙️ 2세대파',
  GEN3: '🎭 3세대파',
};

export const MAX_LEVEL = 10;

// 레벨 구간별 칭호 (최대 10레벨, 2레벨씩 5단계).
const LEVEL_TITLES: { min: number; title: string }[] = [
  { min: 9, title: '헤비 에스케이퍼' },
  { min: 7, title: '마스터 이스케이퍼' },
  { min: 5, title: '베테랑 이스케이퍼' },
  { min: 3, title: '방탈출 러버' },
  { min: 1, title: '새내기 이스케이퍼' },
];

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES.find((t) => level >= t.min)?.title ?? LEVEL_TITLES[LEVEL_TITLES.length - 1].title;
}

// 프로필/캘린더 상단에 노출할 한 줄짜리 성향 배지.
// 공포 역할 > 진행 스타일 > 선호 세대 순으로 우선순위를 둔다 (가장 개성이 드러나는 값부터).
export function getPreferenceBadge(profile: Pick<UserProfile, 'isBeginner' | 'horrorRole' | 'pacingPreference' | 'generationPreference'>): string {
  if (profile.isBeginner) return '🐣 방린이';
  if (profile.horrorRole) return HORROR_ROLE_LABEL[profile.horrorRole];
  if (profile.pacingPreference) return PACING_LABEL[profile.pacingPreference];
  if (profile.generationPreference) return GENERATION_LABEL[profile.generationPreference];
  return '탐색중';
}
