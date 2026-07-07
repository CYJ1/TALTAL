/**
 * 실시간 게이미피케이션 스탯 스케일 연산 로직 (PRD 도메인 2, 사양 #4)
 * 공식: 기존 스탯 점수 + (테마별 고유 능력치 가중치 * 탈출 성공 여부 보너스 배율 * 남은시간 스코어)
 */

const CLEAR_BONUS_MULTIPLIER = 1.2;
const FAIL_BONUS_MULTIPLIER = 0.4;
const MIN_STAT = 0;
const MAX_STAT = 100;

export function remainingTimeScore(remainingSec: number): number {
  const remainingMinutes = remainingSec / 60;
  return Math.min(2, Math.max(0.5, remainingMinutes / 10));
}

export function computeStatGain(
  weight: number,
  cleared: boolean,
  remainingSec: number,
): number {
  const clearBonus = cleared ? CLEAR_BONUS_MULTIPLIER : FAIL_BONUS_MULTIPLIER;
  return weight * clearBonus * remainingTimeScore(remainingSec);
}

export function clampStat(value: number): number {
  return Math.min(MAX_STAT, Math.max(MIN_STAT, value));
}

export interface StatAxes {
  logic: number;
  observe: number;
  speed: number;
  story: number;
  solving: number;
  tank: number;
}

export function applyStatGains(
  current: StatAxes,
  weight: StatAxes,
  cleared: boolean,
  remainingSec: number,
): StatAxes {
  return {
    logic: clampStat(
      current.logic + computeStatGain(weight.logic, cleared, remainingSec),
    ),
    observe: clampStat(
      current.observe + computeStatGain(weight.observe, cleared, remainingSec),
    ),
    speed: clampStat(
      current.speed + computeStatGain(weight.speed, cleared, remainingSec),
    ),
    story: clampStat(
      current.story + computeStatGain(weight.story, cleared, remainingSec),
    ),
    solving: clampStat(
      current.solving + computeStatGain(weight.solving, cleared, remainingSec),
    ),
    tank: clampStat(
      current.tank + computeStatGain(weight.tank, cleared, remainingSec),
    ),
  };
}
