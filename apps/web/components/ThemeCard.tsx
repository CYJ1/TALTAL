import Link from 'next/link';
import TagChip from './TagChip';
import type { ThemeSearchResult } from '@/lib/types';

const STATUS_STYLE: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FEW_LEFT: 'bg-amber-50 text-amber-700 border-amber-200',
  CLOSED: 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through',
};

export default function ThemeCard({ theme }: { theme: ThemeSearchResult }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <Link href={`/themes/${theme.themeId}`} className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl">
          🔑
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="truncate font-semibold text-zinc-900">
              {theme.storeName} <span className="text-zinc-400">·</span> {theme.themeName}
            </h3>
            <span className="shrink-0 text-sm font-medium text-amber-500">★ {theme.rating.toFixed(1)}</span>
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {theme.tags.map((tag) => (
              <TagChip key={tag}>{tag}</TagChip>
            ))}
          </div>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
        <span>매장정원 {theme.capacityMin}~{theme.capacityMax}인</span>
        {theme.recommendedHeadcount && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-medium text-indigo-700">
            👥 {theme.recommendedHeadcount.reason}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {theme.slots.map((slot) => (
          <span
            key={slot.time}
            className={`rounded-md border px-2 py-1 text-xs font-medium ${STATUS_STYLE[slot.status]}`}
          >
            {slot.time}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          href={`/themes/${theme.themeId}/book`}
          className="rounded-xl border border-zinc-200 py-2 text-center text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          매장 공홈 예약
        </Link>
        <Link
          href={`/party/new?themeId=${theme.themeId}`}
          className="rounded-xl bg-indigo-600 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          동행 구하기
        </Link>
      </div>
    </div>
  );
}
