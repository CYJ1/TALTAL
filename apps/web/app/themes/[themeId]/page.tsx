import Link from 'next/link';
import { notFound } from 'next/navigation';
import TagChip from '@/components/TagChip';
import { getThemeDetail } from '@/lib/data';

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FEW_LEFT: 'bg-amber-50 text-amber-700 border-amber-200',
  CLOSED: 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through',
};

export default async function ThemeDetailPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = await getThemeDetail(themeId);
  if (!theme) notFound();

  return (
    <div className="pb-8">
      <div className="flex h-48 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-6xl">
        🔑
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">{theme.storeName}</p>
            <h1 className="text-xl font-bold text-zinc-900">{theme.themeName}</h1>
          </div>
          <span className="shrink-0 text-sm font-semibold text-amber-500">★ {theme.rating.toFixed(1)}</span>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {theme.tags.map((tag) => (
            <TagChip key={tag}>{tag}</TagChip>
          ))}
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">매장 정원</span>
            <span className="font-medium text-zinc-900">{theme.capacityMin}~{theme.capacityMax}인</span>
          </div>
          {theme.recommendedHeadcount && (
            <div className="flex justify-between">
              <span className="text-zinc-500">체감 추천 인원</span>
              <span className="font-medium text-indigo-600">
                👥 {theme.recommendedHeadcount.recommended}인 ({theme.recommendedHeadcount.sampleSize}건 투표)
              </span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h2 className="mb-2 text-sm font-semibold text-zinc-700">오늘의 예약 현황</h2>
          <div className="flex flex-wrap gap-1.5">
            {theme.slots.map((slot) => (
              <span
                key={slot.time}
                className={`rounded-md border px-2 py-1 text-xs font-medium ${STATUS_STYLE[slot.status]}`}
              >
                {slot.time}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <Link
            href={`/party/new?themeId=${theme.themeId}`}
            className="rounded-xl border border-zinc-200 py-3 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            🤝 동행 구하기
          </Link>
          {theme.bookingUrl ? (
            <a
              href={theme.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              📅 예약하러 가기 ↗
            </a>
          ) : (
            <span className="rounded-xl bg-zinc-100 py-3 text-center text-sm font-semibold text-zinc-400">
              예약 링크 준비중
            </span>
          )}
        </div>

        <Link
          href={`/themes/${theme.themeId}/review`}
          className="mt-3 block text-center text-xs font-medium text-zinc-400 underline"
        >
          이미 플레이했나요? 리뷰 남기기
        </Link>
      </div>
    </div>
  );
}
