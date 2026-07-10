'use client';

import { startTransition, useEffect, useRef, useState } from 'react';
import ThemeCard from '@/components/ThemeCard';
import { loadMoreThemesAction } from '@/lib/actions';
import { HOME_PAGE_SIZE } from '@/lib/config';
import type { ThemeSearchResult } from '@/lib/types';

interface Filters {
  district?: string;
  neighborhood?: string;
  tag?: string;
  availableOnly?: boolean;
  lat?: number;
  lng?: number;
}

export default function ThemeList({
  initialThemes,
  filters,
}: {
  initialThemes: ThemeSearchResult[];
  filters: Filters;
}) {
  const [themes, setThemes] = useState(initialThemes);
  const [hasMore, setHasMore] = useState(initialThemes.length === HOME_PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // 필터(구/동/태그/위치 등)가 바뀌면 서버가 다시 첫 페이지를 내려주므로 그걸로 리셋한다.
  useEffect(() => {
    setThemes(initialThemes);
    setHasMore(initialThemes.length === HOME_PAGE_SIZE);
  }, [initialThemes]);

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          loadingRef.current = true;
          setLoading(true);
          startTransition(async () => {
            const more = await loadMoreThemesAction(filters, themes.length);
            setThemes((prev) => [...prev, ...more]);
            setHasMore(more.length === HOME_PAGE_SIZE);
            setLoading(false);
            loadingRef.current = false;
          });
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, themes.length]);

  return (
    <>
      {themes.length === 0 && (
        <p className="py-10 text-center text-sm text-zinc-400">조건에 맞는 테마가 없습니다.</p>
      )}
      {themes.map((theme) => (
        <ThemeCard key={theme.themeId} theme={theme} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} className="py-6 text-center text-xs text-zinc-400">
          {loading ? '더 불러오는 중...' : ''}
        </div>
      )}
    </>
  );
}
