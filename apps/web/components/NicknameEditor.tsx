'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateNicknameAction } from '@/lib/actions';

export default function NicknameEditor({ currentNickname }: { currentNickname: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(currentNickname);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center justify-between py-2.5 text-left text-sm text-zinc-600"
      >
        <span>닉네임 변경</span>
        <span className="flex items-center gap-1 text-zinc-400">
          {currentNickname}
          <span className="text-zinc-300">›</span>
        </span>
      </button>
    );
  }

  async function handleSave() {
    if (!nickname.trim()) return;
    setError(null);
    setPending(true);
    try {
      await updateNicknameAction(nickname.trim());
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="py-2.5">
      <p className="mb-1.5 text-sm text-zinc-600">닉네임 변경</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={30}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !nickname.trim()}
          className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {pending ? '저장 중' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setNickname(currentNickname);
            setError(null);
          }}
          className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500"
        >
          취소
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
