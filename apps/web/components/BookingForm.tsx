'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { TimeSlot } from '@/lib/types';

export default function BookingForm({
  themeId,
  slots,
  capacityMin,
  capacityMax,
  recommendedHeadcount,
}: {
  themeId: string;
  slots: TimeSlot[];
  capacityMin: number;
  capacityMax: number;
  recommendedHeadcount: number;
}) {
  const router = useRouter();
  const availableSlots = slots.filter((s) => s.status !== 'CLOSED');
  const [time, setTime] = useState(availableSlots[0]?.time ?? slots[0]?.time ?? '');
  const [headcount, setHeadcount] = useState(recommendedHeadcount);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const params = new URLSearchParams({ time, headcount: String(headcount) });
    setTimeout(() => router.push(`/themes/${themeId}/book/complete?${params.toString()}`), 400);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">날짜</h2>
        <div className="rounded-xl border border-indigo-600 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700">
          오늘 · {new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">시간대 선택</h2>
        <div className="grid grid-cols-3 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={slot.status === 'CLOSED'}
              onClick={() => setTime(slot.time)}
              className={`rounded-xl border py-2 text-xs font-medium ${
                slot.status === 'CLOSED'
                  ? 'cursor-not-allowed border-zinc-100 text-zinc-300 line-through'
                  : time === slot.time
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-200 text-zinc-600'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">
          인원 수 <span className="text-xs font-normal text-zinc-400">(매장정원 {capacityMin}~{capacityMax}인)</span>
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
          <span className="text-sm text-zinc-500">👥 체감 추천 {recommendedHeadcount}인</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setHeadcount((h) => Math.max(capacityMin, h - 1))}
              className="h-8 w-8 rounded-full border border-zinc-200 text-zinc-500"
            >
              −
            </button>
            <span className="w-4 text-center font-semibold text-zinc-900">{headcount}</span>
            <button
              type="button"
              onClick={() => setHeadcount((h) => Math.min(capacityMax, h + 1))}
              className="h-8 w-8 rounded-full border border-zinc-200 text-zinc-500"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending || !time}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
      >
        {pending ? '예약 처리 중...' : `${time} · ${headcount}인 예약하기`}
      </button>
    </form>
  );
}
