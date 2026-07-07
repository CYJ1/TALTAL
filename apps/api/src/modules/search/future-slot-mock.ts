import { createHash } from 'crypto';

const SLOT_TIMES = [
  '14:00', '15:30', '16:30', '18:00', '18:15', '19:00',
  '19:40', '20:00', '21:15', '21:45', '22:30',
];

/**
 * 매장별 실제 크롤러 어댑터가 아직 없어, 오늘 이후 날짜의 예약 가능 시간은
 * 스크래퍼(apps/scraper)의 "오늘" 목업 생성 로직과 동일한 방식(테마+날짜
 * 시드 기반 재현 가능한 흔들림)으로 임시 생성한다. 실제 어댑터가 붙으면 이
 * 파일은 제거하고 실제 스크래핑 결과로 완전히 대체한다.
 */
export function generateMockSlotsForDate(themeId: string, date: string) {
  const digest = createHash('sha256').update(`${themeId}:${date}`).digest();
  let seedIndex = 0;
  const rng = () => {
    const v = digest[seedIndex % digest.length] / 255;
    seedIndex += 1;
    return v;
  };

  return SLOT_TIMES.map((time) => {
    const roll = rng();
    const status = roll > 0.55 ? 'AVAILABLE' : roll > 0.4 ? 'FEW_LEFT' : 'CLOSED';
    return { time, status };
  });
}
