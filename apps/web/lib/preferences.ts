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

const ROOM_TYPE_LABEL: Record<NonNullable<UserProfile['roomTypePreference']>, string> = {
  PUZZLE: '🧩 문제방파',
  DEVICE: '🔧 장치방파',
};

// 프로필/캘린더 상단에 노출할 한 줄짜리 성향 배지.
// 공포 역할 > 진행 스타일 > 공간 유형 선호 순으로 우선순위를 둔다 (가장 개성이 드러나는 값부터).
export function getPreferenceBadge(profile: Pick<UserProfile, 'isBeginner' | 'horrorRole' | 'pacingPreference' | 'roomTypePreference'>): string {
  if (profile.isBeginner) return '🐣 방린이';
  if (profile.horrorRole) return HORROR_ROLE_LABEL[profile.horrorRole];
  if (profile.pacingPreference) return PACING_LABEL[profile.pacingPreference];
  if (profile.roomTypePreference) return ROOM_TYPE_LABEL[profile.roomTypePreference];
  return '탐색중';
}
