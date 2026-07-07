'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DateSlots } from '@/lib/types';

function formatDateLabel(date: string, index: number): { top: string; bottom: string } {
  if (index === 0) return { top: '오늘', bottom: formatMonthDay(date) };
  if (index === 1) return { top: '내일', bottom: formatMonthDay(date) };
  const weekday = new Intl.DateTimeFormat('ko-KR', { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
  return { top: weekday, bottom: formatMonthDay(date) };
}

function formatMonthDay(date: string): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

export default function BookingForm({
  themeId,
  dateSlots,
  capacityMin,
  capacityMax,
  recommendedHeadcount,
}: {
  themeId: string;
  dateSlots: DateSlots[];
  capacityMin: number;
  capacityMax: number;
  recommendedHeadcount: number;
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(dateSlots[0]?.date ?? '');
  const current = dateSlots.find((d) => d.date === selectedDate) ?? dateSlots[0];
  const slots = current?.slots ?? [];
  const availableSlots = slots.filter((s) => s.status !== 'CLOSED');

  const [time, setTime] = useState(availableSlots[0]?.time ?? slots[0]?.time ?? '');
  const [headcount, setHeadcount] = useState(recommendedHeadcount);
  const [pending, setPending] = useState(false);

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    const next = dateSlots.find((d) => d.date === date);
    const nextAvailable = next?.slots.filter((s) => s.status !== 'CLOSED') ?? [];
    setTime(nextAvailable[0]?.time ?? next?.slots[0]?.time ?? '');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    const params = new URLSearchParams({ date: selectedDate, time, headcount: String(headcount) });
    setTimeout(() => router.push(`/themes/${themeId}/book/complete?${params.toString()}`), 400);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4">
      <section>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">날짜</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dateSlots.map((d, i) => {
            const label = formatDateLabel(d.date, i);
            const isSelected = d.date === selectedDate;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => handleSelectDate(d.date)}
                className={`flex shrink-0 flex-col items-center rounded-xl border px-3.5 py-2 text-xs font-medium ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-zinc-200 text-zinc-600'
                }`}
              >
                <span>{label.top}</span>
                <span className={isSelected ? 'text-indigo-100' : 'text-zinc-400'}>{label.bottom}</span>
              </button>
            );
          })}
        </div>
        {current?.cacheStatus === 'MOCK_ESTIMATE' && (
          <p className="mt-2 text-xs text-zinc-400">
            매장별 실시간 크롤러가 아직 없는 날짜라 과거 패턴 기반 예상 데이터입니다. 실제 잔여석은 매장에 확인해 주세요.
          </p>
        )}
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
        {pending ? '예약 처리 중...' : `${formatMonthDay(selectedDate)} ${time} · ${headcount}인 예약하기`}
      </button>
    </form>
  );
}
