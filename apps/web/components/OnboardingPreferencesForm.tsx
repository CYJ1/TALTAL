'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePreferencesAction } from '@/lib/actions';
import PreferencesFields, { isPreferencesComplete, type PreferencesState } from '@/components/PreferencesFields';

const EMPTY_PREFERENCES: PreferencesState = {
  isBeginner: null,
  experienceTier: null,
  genrePreferences: [],
  pacingPreference: null,
  generationPreference: null,
  horrorRole: null,
};

// 소셜 로그인으로 방금 가입한 사용자가 로그인 직후 한 번 거치는 화면.
// 이메일 가입 폼과 동일한 선호도 질문을 받아 그 결과로 성향 파악에 반영한다.
export default function OnboardingPreferencesForm() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<PreferencesState>(EMPTY_PREFERENCES);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wantsHorror = preferences.genrePreferences.includes('HORROR_THRILLER');
  const preferencesComplete = isPreferencesComplete(preferences);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { isBeginner, experienceTier, genrePreferences, pacingPreference, generationPreference, horrorRole } =
        preferences;
      await updatePreferencesAction({
        isBeginner: isBeginner ?? false,
        experienceTier: isBeginner ? undefined : (experienceTier ?? undefined),
        genrePreferences: isBeginner ? undefined : genrePreferences,
        pacingPreference: isBeginner ? undefined : (pacingPreference ?? undefined),
        generationPreference: isBeginner ? undefined : (generationPreference ?? undefined),
        horrorRole: isBeginner || !wantsHorror ? undefined : (horrorRole ?? undefined),
      });
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-900">가입 완료! 몇 가지만 더 알려주세요 🔑</h1>
      <p className="mt-1 text-sm text-zinc-500">취향에 맞는 방탈출을 추천해드릴게요.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <PreferencesFields state={preferences} onChange={setPreferences} />

        <button
          type="submit"
          disabled={pending || !preferencesComplete}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? '저장 중...' : '시작하기'}
        </button>
        {error && <p className="text-center text-xs text-rose-500">{error}</p>}
      </form>
    </div>
  );
}
