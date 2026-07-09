import { redirect } from 'next/navigation';
import PartyEmptyState from '@/components/PartyEmptyState';
import PartyJoinButton from '@/components/PartyJoinButton';
import { getPartyDetail } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

const STATUS_LABEL: Record<string, string> = {
  OPEN: '모집 중',
  FILLED: '정원 마감 · 플레이 대기',
  SETTLED: '정산 완료',
  DISPUTED: '분쟁 처리 중',
};

function formatReservedAt(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export default async function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');

  const { id } = await params;
  const party = await getPartyDetail(id);
  if (!party) return <PartyEmptyState notFoundId={id} />;

  const emptySlots = Math.max(0, party.capacity - party.participants.length);
  const perPersonDeposit = Math.round(party.totalPriceWon / party.capacity);
  const alreadyJoined = party.participants.some((p) => p.userId === sessionUser.id);

  return (
    <div className="space-y-4 px-4 py-4 pb-10">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
        <p className="font-semibold text-emerald-700">
          {party.verifiedBookingOk ? '✅ 안심 예약 인증 완료' : '⏳ 예약 인증 대기 중'}
        </p>
        <p className="mt-0.5 text-emerald-600">
          확정 테마: {party.storeName} · {party.themeName} ({formatReservedAt(party.reservedAt)})
        </p>
        <p className="mt-1 text-xs font-medium text-emerald-500">{STATUS_LABEL[party.status]}</p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-zinc-700">참여자 (실시간 파티 시너지 스탯)</h2>
        <div className="grid grid-cols-2 gap-2">
          {party.participants.map((p) => (
            <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-3">
              <p className="truncate text-xs font-semibold text-zinc-900">
                {p.userId === party.hostUserId ? '방장' : '팀원'}: {p.nickname}
              </p>
              <p className="text-xs text-zinc-400">{p.mannerTemp.toFixed(1)}°C</p>
              {p.stat && (
                <p className="mt-1 truncate text-[10px] text-indigo-500">
                  #추리{Math.round(p.stat.logic)} #탱{Math.round(p.stat.tank)}
                </p>
              )}
            </div>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 p-3 text-xs text-zinc-400"
            >
              빈자리 대기
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">예약 테마 정가 ({party.capacity}인 기준)</span>
          <span className="font-medium text-zinc-900">{party.totalPriceWon.toLocaleString()}원</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-zinc-500">나의 안전 예치 보증금</span>
          <span className="font-medium text-zinc-900">{perPersonDeposit.toLocaleString()}원</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
          ※ 플레이 무사 종료 확인 시 전액 안전 정산 분배되며, 당일 무단 노쇼 발생 시 보증금 전액이
          위약금으로 귀속됩니다.
        </p>
      </div>

      <PartyJoinButton
        partyId={party.id}
        depositWon={perPersonDeposit}
        alreadyJoined={alreadyJoined}
        isFull={party.participants.length >= party.capacity}
      />
    </div>
  );
}
