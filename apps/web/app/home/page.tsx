import Link from 'next/link';
import ThemeCard from '@/components/ThemeCard';
import TagChip from '@/components/TagChip';
import Logo from '@/components/Logo';
import { searchThemes } from '@/lib/data';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; availableOnly?: string }>;
}) {
  const params = await searchParams;
  const themes = await searchThemes({
    tag: params.tag,
    availableOnly: params.availableOnly === 'true',
  });

  const popularTags = ['장치중심', '문제방', '탱커필수', '스토리연계성'];

  return (
    <div className="pb-6">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Link href="/notifications" className="text-lg">
              🔔
            </Link>
            <Link href="/profile" className="text-lg">
              👤
            </Link>
          </div>
        </div>

        <button className="mt-2 flex items-center gap-1 text-sm font-semibold text-zinc-900">
          서울 강남구 <span className="text-zinc-400">▾</span>
        </button>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <span className="shrink-0 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white">오늘</span>
          <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-600">18:00-20:00</span>
          <Link
            href={params.availableOnly === 'true' ? '/home' : '/home?availableOnly=true'}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              params.availableOnly === 'true' ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            예약가능 토글 {params.availableOnly === 'true' ? 'ON' : 'OFF'}
          </Link>
          <span className="shrink-0 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
            👥 체감 추천인원 필터
          </span>
        </div>

        <div className="mt-2 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {popularTags.map((tag) => (
            <Link key={tag} href={`/home?tag=${encodeURIComponent(tag)}`}>
              <TagChip tone={params.tag === tag ? 'accent' : 'default'}>{tag}</TagChip>
            </Link>
          ))}
          {params.tag && (
            <Link href="/home" className="text-xs font-medium text-zinc-400 underline">
              필터 초기화
            </Link>
          )}
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {themes.length === 0 && (
          <p className="py-10 text-center text-sm text-zinc-400">조건에 맞는 테마가 없습니다.</p>
        )}
        {themes.map((theme) => (
          <ThemeCard key={theme.themeId} theme={theme} />
        ))}
      </main>
    </div>
  );
}
