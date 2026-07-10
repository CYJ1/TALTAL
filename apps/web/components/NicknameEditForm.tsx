'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkNicknameAvailableAction, updateNicknameAction } from '@/lib/actions';

export default function NicknameEditForm({ currentNickname }: { currentNickname: string }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(currentNickname);
  const [checkedValue, setCheckedValue] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = checkedValue === nickname && available === true && !saving;

  function handleChange(value: string) {
    setNickname(value);
    // 확인 후 값이 바뀌면 다시 확인해야 한다.
    setCheckedValue(null);
    setAvailable(null);
    setError(null);
  }

  async function handleCheck() {
    if (!nickname.trim()) return;
    setChecking(true);
    setError(null);
    try {
      const ok = await checkNicknameAvailableAction(nickname.trim());
      setAvailable(ok);
      setCheckedValue(nickname);
    } catch {
      setError('중복확인 중 오류가 발생했어요.');
    } finally {
      setChecking(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateNicknameAction(nickname.trim());
      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.');
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-lg font-bold text-zinc-900">닉네임 변경</h1>
      <p className="mt-1 text-sm text-zinc-500">다른 사람과 겹치지 않는 닉네임으로 바꿀 수 있어요.</p>

      <div className="mt-6 flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => handleChange(e.target.value)}
          maxLength={30}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking || !nickname.trim() || checkedValue === nickname}
          className="shrink-0 rounded-xl border border-indigo-600 px-4 py-3 text-sm font-semibold text-indigo-600 disabled:opacity-40"
        >
          {checking ? '확인 중' : '중복확인'}
        </button>
      </div>

      {checkedValue === nickname && available !== null && (
        <p className={`mt-2 text-xs font-medium ${available ? 'text-emerald-600' : 'text-rose-500'}`}>
          {available ? '사용 가능한 닉네임이에요 ✓' : '이미 사용 중인 닉네임이에요.'}
        </p>
      )}
      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-40"
      >
        {saving ? '저장 중...' : '저장하기'}
      </button>
    </div>
  );
}
