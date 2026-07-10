import { redirect } from 'next/navigation';
import TagChip from '@/components/TagChip';
import { getProfile, getRecommendations } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

export default async function RecommendationsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const [profile, recommendations] = await Promise.all([
    getProfile(sessionUser.id),
    getRecommendations(sessionUser.id),
  ]);

  return (
    <div className="px-4 py-4 pb-10">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-sm">
        <p className="text-xs font-medium text-indigo-100">✨ AI Graph 엔지니어링 분석 결과</p>
        <h1 className="mt-1 text-lg font-bold">
          {profile.nickname}님을 위한 다음 저격 추천 테마
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-indigo-100">
          현재 다차원 육각 스탯 및 클리어 인원 성향과 유사한 마니아 {recommendations.peerSampleSize.toLocaleString()}인의
          인생테마 트래킹 결과입니다.
        </p>
      </section>

      {!recommendations.aiEngineAvailable && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-700">
          ⚠️ AI 추천 엔진에 지금 연결할 수 없어요. 잠시 후 다시 시도해주세요.
        </div>
      )}

      <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none]">
        {recommendations.items.map((item) => (
          <div
            key={item.themeId}
            className="w-[85%] shrink-0 snap-start rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl">
                🧩
              </div>
              <span className="rounded-full bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white">
                매칭률 {item.matchScore.toFixed(1)}%
              </span>
            </div>

            <p className="mt-3 font-semibold text-zinc-900">
              {item.storeName} · {item.themeName}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {item.tags.map((tag) => (
                <TagChip key={tag}>{tag}</TagChip>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              👥 추천 인원: {item.recommendedHeadcount}인 최적 (매장정원 {item.capacityMin}~{item.capacityMax}인)
            </p>

            <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-xs leading-relaxed text-indigo-700">
              💡 <span className="font-semibold">Graph AI 분석 사유</span>
              <p className="mt-1">{item.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
