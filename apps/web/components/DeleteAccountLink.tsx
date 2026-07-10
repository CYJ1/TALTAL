'use client';

import { useState, useTransition } from 'react';
import { deleteAccountAction } from '@/lib/actions';

export default function DeleteAccountLink() {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="w-full py-2 text-center text-xs text-zinc-400 underline"
      >
        회원탈퇴
      </button>

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-xl">
            <p className="text-sm font-semibold text-rose-700">정말 탈퇴하시겠어요?</p>
            <p className="mt-2 text-xs text-rose-500">
              리뷰, 육각 스탯, 플레이 기록이 모두 삭제되고 되돌릴 수 없어요.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={pending}
                className="flex-1 rounded-xl border border-zinc-200 bg-white py-2.5 text-xs font-medium text-zinc-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    setError(null);
                    try {
                      await deleteAccountAction();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : '회원탈퇴에 실패했습니다.');
                    }
                  })
                }
                disabled={pending}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                {pending ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
            {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
}
