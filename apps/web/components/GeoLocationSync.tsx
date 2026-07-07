'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * 첫 진입 시 브라우저 위치 권한을 요청해, 성공하면 lat/lng를 URL에 반영해
 * 거리순 정렬이 자동 적용되도록 한다. 권한 거부/미지원 시 조용히 아무 것도
 * 하지 않는다 (구/동 필터 등 기존 검색 경험을 그대로 유지).
 */
export default function GeoLocationSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (searchParams.get('lat') || searchParams.get('lng')) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;
    attempted.current = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('lat', String(position.coords.latitude));
        params.set('lng', String(position.coords.longitude));
        // 위경도 거리순 정렬은 구/동 필터와 함께 쓰면 의미가 겹치므로 초기화한다
        params.delete('district');
        params.delete('neighborhood');
        router.replace(`/home?${params.toString()}`);
      },
      () => {
        // 거부/실패 시 기본 필터(전체 목록)로 그대로 둔다
      },
      { timeout: 5000, maximumAge: 5 * 60 * 1000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
