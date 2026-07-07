'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { DistrictFacet } from '@/lib/types';

export default function DistrictPicker({
  facets,
  currentDistrict,
  currentNeighborhood,
}: {
  facets: DistrictFacet[];
  currentDistrict?: string;
  currentNeighborhood?: string;
}) {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [pickerDistrict, setPickerDistrict] = useState(currentDistrict ?? '');

  const label = currentNeighborhood ?? currentDistrict ?? '서울 전체';
  const activeFacet = facets.find((f) => f.district === pickerDistrict);

  function navigate(district?: string, neighborhood?: string) {
    const params = new URLSearchParams(searchParams.toString());
    // 위치 필터를 바꾸면 위경도 기반 거리순 정렬과 의미가 겹치므로 초기화한다
    params.delete('lat');
    params.delete('lng');
    if (district) params.set('district', district);
    else params.delete('district');
    if (neighborhood) params.set('neighborhood', neighborhood);
    else params.delete('neighborhood');
    const query = params.toString();
    // router.push()는 파라미터가 줄어드는 네비게이션(같은 경로, 쿼리만 제거)을
    // 간헐적으로 무시하는 현상이 있어 확실한 전체 새로고침으로 처리한다.
    window.location.href = query ? `/home?${query}` : '/home';
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          setPickerDistrict(currentDistrict ?? '');
          setIsOpen((v) => !v);
        }}
        className="flex items-center gap-1 text-sm font-semibold text-zinc-900"
      >
        {label} <span className="text-zinc-400">▾</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-8 z-30 flex max-h-80 w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <div className="w-1/2 overflow-y-auto border-r border-zinc-100 py-1">
              <button
                onClick={() => navigate(undefined, undefined)}
                className={`block w-full px-3 py-2 text-left text-sm ${
                  !currentDistrict ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-zinc-700'
                }`}
              >
                서울 전체
              </button>
              {facets.map((f) => (
                <button
                  key={f.district}
                  onClick={() => setPickerDistrict(f.district)}
                  className={`block w-full px-3 py-2 text-left text-sm ${
                    pickerDistrict === f.district
                      ? 'bg-indigo-50 font-semibold text-indigo-700'
                      : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {f.district.replace('서울 ', '')}
                </button>
              ))}
            </div>
            <div className="w-1/2 overflow-y-auto py-1">
              {activeFacet ? (
                <>
                  <button
                    onClick={() => navigate(pickerDistrict, undefined)}
                    className={`block w-full px-3 py-2 text-left text-sm ${
                      currentDistrict === pickerDistrict && !currentNeighborhood
                        ? 'bg-indigo-50 font-semibold text-indigo-700'
                        : 'text-zinc-700'
                    }`}
                  >
                    {pickerDistrict.replace('서울 ', '')} 전체
                  </button>
                  {activeFacet.neighborhoods.map((n) => (
                    <button
                      key={n}
                      onClick={() => navigate(pickerDistrict, n)}
                      className={`block w-full px-3 py-2 text-left text-sm ${
                        currentNeighborhood === n
                          ? 'bg-indigo-50 font-semibold text-indigo-700'
                          : 'text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </>
              ) : (
                <p className="px-3 py-2 text-xs text-zinc-400">구를 먼저 선택하세요</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
