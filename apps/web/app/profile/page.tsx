import Link from 'next/link';
import { redirect } from 'next/navigation';
import HexagonRadarChart from '@/components/HexagonRadarChart';
import LogoutButton from '@/components/LogoutButton';
import NicknameEditor from '@/components/NicknameEditor';
import { getProfile, getUserReviews } from '@/lib/data';
import { getPreferenceBadge } from '@/lib/preferences';
import { getSessionUser } from '@/lib/session';

// 흙길(최하) < 풀길 < 풀꽃길 < 꽃길 < 꽃밭길 < 인생테마(최상) 순
const GRADE_STYLE: Record<string, string> = {
  흙길: 'bg-rose-50 text-rose-600',
  풀길: 'bg-zinc-100 text-zinc-600',
  풀꽃길: 'bg-lime-50 text-lime-700',
  꽃길: 'bg-emerald-50 text-emerald-700',
  꽃밭길: 'bg-teal-50 text-teal-700',
  인생테마: 'bg-amber-50 text-amber-700',
};

const STAT_LABELS: { key: keyof Awaited<ReturnType<typeof getProfile>>['stat']; label: string }[] = [
  { key: 'logic', label: '추리력' },
  { key: 'observe', label: '직관력' },
  { key: 'speed', label: '활동성' },
  { key: 'story', label: '스토리이해' },
  { key: 'solving', label: '문제해결' },
  { key: 'tank', label: '탱킹력' },
];

export default async function ProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const [profile, reviews] = await Promise.all([
    getProfile(sessionUser.id),
    getUserReviews(sessionUser.id),
  ]);

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
          <span className="font-semibold text-indigo-600">{getPreferenceBadge(profile)}</span>
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
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">내가 쓴 리뷰 ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-400">아직 작성한 리뷰가 없어요.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {reviews.map((review) => (
              <Link
                key={review.id}
                href={`/themes/${review.themeId}`}
                className="block py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {review.storeName} · {review.themeName}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      GRADE_STYLE[review.grade] ?? 'bg-zinc-100 text-zinc-600'
                    }`}
                  >
                    {review.grade}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {review.selectedTags.map((tag) => (
                    <span key={tag} className="rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500">
                      #{tag}
                    </span>
                  ))}
                </div>
                {review.comment && (
                  <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{review.comment}</p>
                )}
                <p className="mt-1 text-[11px] text-zinc-400">
                  {new Date(review.createdAt).toLocaleDateString('ko-KR')} · 체감 {review.votedHeadcount}인
                  {review.cleared ? ' · 클리어' : ' · 실패'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">계정</h2>
        <div className="divide-y divide-zinc-100 text-sm">
          <NicknameEditor currentNickname={profile.nickname} />
          <div className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>알림 설정</span>
            <span className="text-zinc-300">›</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>정산 계좌 등록</span>
            <span className="text-zinc-300">›</span>
          </div>
          <Link href="/legal/terms" className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>이용약관</span>
            <span className="text-zinc-300">›</span>
          </Link>
          <Link href="/legal/privacy" className="flex items-center justify-between py-2.5 text-zinc-600">
            <span>개인정보처리방침</span>
            <span className="text-zinc-300">›</span>
          </Link>
        </div>
      </section>

      <LogoutButton />
    </div>
  );
}
