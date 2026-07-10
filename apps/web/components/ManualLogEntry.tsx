'use client';

import { useState, useTransition } from 'react';
import { searchThemesForLogAction } from '@/lib/actions';
import ReviewForm from '@/components/ReviewForm';
import type { ThemeSearchResult } from '@/lib/types';

// 앱으로 예약 안 하고 이미 플레이한 테마를 나중에 기록/리뷰하는 화면.
// 먼저 테마를 이름으로 검색해서 고르고, 고르고 나면 일반 리뷰 폼(+날짜 선택)을 보여준다.
export default function ManualLogEntry() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ThemeSearchResult[]>([]);
  const [selected, setSelected] = useState<ThemeSearchResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [searched, setSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const found = await searchThemesForLogAction(query);
      setResults(found);
      setSearched(true);
    });
  }

  if (selected) {
    return (
      <div className="px-4 py-4 pb-10">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-xs font-medium text-zinc-400 underline"
        >
          ← 다른 테마 다시 찾기
        </button>
        <h1 className="mt-2 text-sm font-semibold text-zinc-500">간편 리뷰 & 일지 등록</h1>
        <p className="mt-0.5 text-lg font-bold text-zinc-900">
          {selected.storeName} · {selected.themeName}
        </p>
        <ReviewForm themeId={selected.themeId} manualEntry />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 pb-10">
      <h1 className="text-lg font-bold text-zinc-900">직접 플레이 기록 추가</h1>
      <p className="mt-1 text-sm text-zinc-500">
        탈탈로 예약 안 하고 플레이한 테마도 검색해서 리뷰를 남길 수 있어요.
      </p>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="테마 이름 또는 매장 이름"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={pending || !query.trim()}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? '검색 중' : '검색'}
        </button>
      </form>

      <div className="mt-4 divide-y divide-zinc-100">
        {searched && !pending && results.length === 0 && (
          <p className="py-6 text-center text-xs text-zinc-400">일치하는 테마를 못 찾았어요.</p>
        )}
        {results.map((r) => (
          <button
            key={r.themeId}
            type="button"
            onClick={() => setSelected(r)}
            className="flex w-full items-center justify-between py-3 text-left"
          >
            <span>
              <span className="block text-sm font-semibold text-zinc-900">{r.themeName}</span>
              <span className="block text-xs text-zinc-400">{r.storeName}</span>
            </span>
            <span className="text-zinc-300">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
