'use client';

import { useState, useTransition } from 'react';
import { joinPartyAction } from '@/lib/actions';

export default function PartyJoinButton({
  partyId,
  depositWon,
  alreadyJoined,
  isFull,
}: {
  partyId: string;
  depositWon: number;
  alreadyJoined: boolean;
  isFull: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [joined, setJoined] = useState(alreadyJoined);
  const [error, setError] = useState<string | null>(null);

  if (joined) {
    return (
      <div className="rounded-xl bg-emerald-50 py-3 text-center text-sm font-semibold text-emerald-700">
        ✅ 안전 예치 완료 — 파티 탑승이 확정되었습니다
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending || isFull}
        onClick={() =>
          startTransition(async () => {
            try {
              await joinPartyAction(partyId);
              setJoined(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : '참여에 실패했습니다');
            }
          })
        }
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
      >
        {isFull ? '정원이 가득 찼습니다' : pending ? '결제 처리 중...' : `💳 ${depositWon.toLocaleString()}원 안전 결제하고 파티 탑승하기`}
      </button>
      {error && <p className="mt-1 text-center text-xs text-rose-500">{error}</p>}
    </div>
  );
}
