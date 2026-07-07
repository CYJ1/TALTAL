'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

/**
 * 위치 기반 거리순 정렬은 명시적으로 버튼을 눌렀을 때만 적용한다. 첫 진입 시
 * 자동으로 위치 권한을 요청하면 사용자 위치 주변 매장만 상단에 몰려 보여서
 * "서울 전체가 아니라 내 동네만 검색된다"는 오해를 준다 — 기본 화면은 항상
 * 필터 없는 전체 목록이어야 하고, 위치순 정렬은 사용자가 원할 때 켜는 옵션이다.
 */
export default function GeoLocationSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const isActive = Boolean(searchParams.get('lat') && searchParams.get('lng'));

  function handleClick() {
    if (isActive) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('lat');
      params.delete('lng');
      const query = params.toString();
      // router.push()로는 검색 파라미터 제거만 있는 네비게이션이 간헐적으로
      // 무시되는 현상이 있어(경로는 동일하고 쿼리만 줄어드는 경우), 확실한
      // 전체 새로고침으로 처리한다 — 토글 끄기는 자주 일어나는 동작이 아니라
      // 부드러운 전환보다 확실한 동작이 더 중요하다.
      window.location.href = query ? `/home?${query}` : '/home';
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', String(position.coords.latitude));
        params.set('lng', String(position.coords.longitude));
        params.delete('district');
        params.delete('neighborhood');
        router.push(`/home?${params.toString()}`);
        setStatus('idle');
      },
      () => setStatus('error'),
      { timeout: 5000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
        isActive ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
      }`}
    >
      {status === 'loading'
        ? '위치 확인 중...'
        : status === 'error'
          ? '위치 확인 실패 (다시 시도)'
          : isActive
            ? '📍 내 위치 기준 ON'
            : '📍 내 위치 근처'}
    </button>
  );
}
