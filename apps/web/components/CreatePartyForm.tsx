'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPartyAction } from '@/lib/actions';

const PER_PERSON_ESTIMATE = 28000;

export default function CreatePartyForm({
  themeId,
  themeName,
  storeName,
  capacityMin,
  capacityMax,
  defaultTime,
  defaultHeadcount,
}: {
  themeId: string;
  themeName: string;
  storeName: string;
  capacityMin: number;
  capacityMax: number;
  defaultTime?: string;
  defaultHeadcount?: number;
}) {
  const router = useRouter();
  const [capacity, setCapacity] = useState(defaultHeadcount ?? capacityMin);
  const [totalPriceWon, setTotalPriceWon] = useState(capacity * PER_PERSON_ESTIMATE);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleCapacityChange(next: number) {
    const clamped = Math.max(capacityMin, Math.min(capacityMax, next));
    setCapacity(clamped);
    setTotalPriceWon(clamped * PER_PERSON_ESTIMATE);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!screenshotName) {
      setError('예약 완료 캡처본을 업로드해주세요 (OCR 인증에 필요).');
      return;
    }
    setPending(true);
    try {
      const { id } = await createPartyAction({
        themeId,
        reservedAt: new Date().toISOString(),
        capacity,
        totalPriceWon,
        bookingScreenshotBase64: `mock:${screenshotName}`,
      });
      router.push(`/party/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '파티 개설에 실패했습니다');
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
        <p className="font-semibold text-zinc-900">
          {storeName} · {themeName}
        </p>
        {defaultTime && <p className="mt-1 text-xs text-zinc-500">예약 시간: {defaultTime}</p>}
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">
          1. 예약 완료 캡처본 업로드 <span className="text-xs font-normal text-zinc-400">(Naver CLOVA OCR 인증)</span>
        </h2>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
          {screenshotName ? (
            <span className="font-medium text-emerald-600">✅ {screenshotName} 업로드됨 (인증 통과)</span>
          ) : (
            <>
              <span className="text-2xl">📸</span>
              <span className="mt-1">탭하여 예약 완료 화면 캡처본 업로드</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setScreenshotName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">
          2. 모집 정원 <span className="text-xs font-normal text-zinc-400">(매장정원 {capacityMin}~{capacityMax}인)</span>
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
          <span className="text-sm text-zinc-500">방장 본인 포함</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleCapacityChange(capacity - 1)}
              className="h-8 w-8 rounded-full border border-zinc-200 text-zinc-500"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold text-zinc-900">{capacity}</span>
            <button
              type="button"
              onClick={() => handleCapacityChange(capacity + 1)}
              className="h-8 w-8 rounded-full border border-zinc-200 text-zinc-500"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-indigo-50 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-indigo-700">예약 테마 정가 ({capacity}인 기준)</span>
          <span className="font-semibold text-indigo-900">{totalPriceWon.toLocaleString()}원</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-indigo-700">1인당 안전 예치 보증금</span>
          <span className="font-semibold text-indigo-900">
            {Math.round(totalPriceWon / capacity).toLocaleString()}원
          </span>
        </div>
      </section>

      {error && <p className="text-center text-xs text-rose-500">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? '개설 처리 중...' : '🔐 안전 에스크로 동행 파티 개설하기'}
      </button>
    </form>
  );
}
