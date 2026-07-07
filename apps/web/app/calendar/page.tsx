import Link from 'next/link';
import { redirect } from 'next/navigation';
import HexagonRadarChart from '@/components/HexagonRadarChart';
import { getCalendar, getProfile } from '@/lib/data';
import { getPreferenceBadge } from '@/lib/preferences';
import { getSessionUser } from '@/lib/session';

const DEMO_MONTH = '2026-07';
const DAYS_IN_MONTH = 31;
const FIRST_WEEKDAY = 3; // 2026-07-01 is a Wednesday (0=Sun)
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default async function CalendarPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const [profile, entries] = await Promise.all([
    getProfile(sessionUser.id),
    getCalendar(sessionUser.id, DEMO_MONTH),
  ]);

  const entriesByDay = new Map(entries.map((e) => [Number(e.date.split('-')[2]), e]));

  const cells: (number | null)[] = [
    ...Array(FIRST_WEEKDAY).fill(null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div className="space-y-5 px-4 py-4 pb-8">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900">
              {profile.nickname} <span className="ml-1 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">Lv.{profile.level} 헤비 에스케이퍼</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              매너온도 {profile.mannerTemp.toFixed(1)}°C · 성향{' '}
              <span className="font-medium text-indigo-600">{getPreferenceBadge(profile)}</span>
            </p>
          </div>
          <Link href="/profile" className="shrink-0 text-xs font-medium text-indigo-600 underline">
            프로필 전체보기
          </Link>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Total 클리어 {profile.totalClears}회</span>
            <span>Next EXP {profile.expPercent}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-indigo-600" style={{ width: `${profile.expPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">실시간 성장형 육각 스탯</h2>
        <HexagonRadarChart stat={profile.stat} />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">&lt; 2026년 7월 &gt; 스마트 기록 캘린더</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-400">
          {WEEKDAYS.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const entry = entriesByDay.get(day);
            return (
              <div
                key={idx}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${
                  entry ? 'border' : 'text-zinc-500'
                } ${
                  entry?.status === 'PENDING_REVIEW'
                    ? 'border-amber-300 bg-amber-50 text-amber-700'
                    : entry
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                      : ''
                }`}
              >
                <span>{day}</span>
                {entry && <span className="text-[10px] leading-tight">{entry.themeName}</span>}
              </div>
            );
          })}
        </div>

        {entries.some((e) => e.status === 'PENDING_REVIEW') && (
          <div className="mt-3 space-y-2">
            {entries
              .filter((e) => e.status === 'PENDING_REVIEW')
              .map((e) => (
                <Link
                  key={e.id}
                  href={`/themes/${e.themeId}/review`}
                  className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm"
                >
                  <span className="text-amber-800">🔔 {e.themeName} 플레이 리뷰를 기다리는 중</span>
                  <span className="font-semibold text-amber-600">Write!</span>
                </Link>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
