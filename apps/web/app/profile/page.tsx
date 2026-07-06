import HexagonRadarChart from '@/components/HexagonRadarChart';
import LogoutButton from '@/components/LogoutButton';
import { DEMO_USER_ID } from '@/lib/config';
import { getProfile } from '@/lib/data';

const STAT_LABELS: { key: keyof Awaited<ReturnType<typeof getProfile>>['stat']; label: string }[] = [
  { key: 'logic', label: '추리력' },
  { key: 'observe', label: '직관력' },
  { key: 'speed', label: '활동성' },
  { key: 'story', label: '스토리이해' },
  { key: 'solving', label: '문제해결' },
  { key: 'tank', label: '탱킹력' },
];

export default async function ProfilePage() {
  const profile = await getProfile(DEMO_USER_ID);

  return (
    <div className="space-y-5 px-4 py-6 pb-10">
      <section className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-4xl">
          🕵️
        </div>
        <h1 className="mt-3 text-lg font-bold text-zinc-900">{profile.nickname}</h1>
        <span className="mt-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
          Lv.{profile.level} 헤비 에스케이퍼
        </span>
        <p className="mt-2 text-sm text-zinc-500">
          매너온도 <span className="font-semibold text-rose-500">{profile.mannerTemp.toFixed(1)}°C</span> · 성향{' '}
          <span className="font-semibold text-indigo-600">🛡 탱커</span>
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-zinc-900">{profile.totalClears}</p>
          <p className="mt-0.5 text-xs text-zinc-500">Total 클리어</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-zinc-900">{profile.expPercent}%</p>
          <p className="mt-0.5 text-xs text-zinc-500">Next Lv까지 EXP</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">나의 육각 능력치</h2>
        <HexagonRadarChart stat={profile.stat} />
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          {STAT_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-lg bg-zinc-50 py-2">
              <p className="font-semibold text-zinc-900">{Math.round(profile.stat[key])}</p>
              <p className="text-zinc-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">계정</h2>
        <div className="divide-y divide-zinc-100 text-sm">
          <div className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>닉네임 변경</span>
            <span className="text-zinc-300">›</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>알림 설정</span>
            <span className="text-zinc-300">›</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>정산 계좌 등록</span>
            <span className="text-zinc-300">›</span>
          </div>
        </div>
      </section>

      <LogoutButton />
    </div>
  );
}
