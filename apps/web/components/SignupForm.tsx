'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupAction } from '@/lib/actions';
import PreferencesFields, { isPreferencesComplete, type PreferencesState } from '@/components/PreferencesFields';

// 이용약관/개인정보처리방침 보기 -> 뒤로가기로 돌아왔을 때 작성 중이던 내용이
// 날아가지 않도록 sessionStorage에 임시 저장한다 (탭을 닫으면 사라짐).
// 비밀번호는 보안상 저장하지 않는다 — 뒤로가기 후 비밀번호만 다시 입력하면 된다.
const DRAFT_KEY = 'taltal-signup-draft';

interface SignupDraft extends PreferencesState {
  nickname: string;
  email: string;
  agreed: boolean;
}

const EMPTY_PREFERENCES: PreferencesState = {
  isBeginner: null,
  experienceTier: null,
  genrePreferences: [],
  pacingPreference: null,
  generationPreference: null,
  horrorRole: null,
};

function loadDraft(): SignupDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as SignupDraft) : null;
  } catch {
    return null;
  }
}

export default function SignupForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState(() => loadDraft()?.nickname ?? '');
  const [email, setEmail] = useState(() => loadDraft()?.email ?? '');
  const [password, setPassword] = useState('');
  const [preferences, setPreferences] = useState<PreferencesState>(() => loadDraft() ?? EMPTY_PREFERENCES);
  const [agreed, setAgreed] = useState(() => loadDraft()?.agreed ?? false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft: SignupDraft = { nickname, email, agreed, ...preferences };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [nickname, email, agreed, preferences]);

  const wantsHorror = preferences.genrePreferences.includes('HORROR_THRILLER');
  const preferencesComplete = isPreferencesComplete(preferences);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const { isBeginner, experienceTier, genrePreferences, pacingPreference, generationPreference, horrorRole } =
        preferences;
      await signupAction({
        email,
        password,
        nickname,
        isBeginner: isBeginner ?? false,
        experienceTier: isBeginner ? undefined : (experienceTier ?? undefined),
        genrePreferences: isBeginner ? undefined : genrePreferences,
        pacingPreference: isBeginner ? undefined : (pacingPreference ?? undefined),
        generationPreference: isBeginner ? undefined : (generationPreference ?? undefined),
        horrorRole: isBeginner || !wantsHorror ? undefined : (horrorRole ?? undefined),
      });
      sessionStorage.removeItem(DRAFT_KEY);
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-900">탈탈에 오신 것을 환영해요 🔑</h1>
      <p className="mt-1 text-sm text-zinc-500">몇 가지만 알려주시면 바로 시작할 수 있어요.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          required
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
        <input
          type="email"
          required
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="비밀번호 (8자 이상)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />

        <PreferencesFields state={preferences} onChange={setPreferences} />

        <label className="flex items-start gap-2 text-xs text-zinc-500">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-400"
          />
          <span>
            <Link href="/legal/terms" className="font-medium text-indigo-600 underline">
              이용약관
            </Link>{' '}
            및{' '}
            <Link href="/legal/privacy" className="font-medium text-indigo-600 underline">
              개인정보처리방침
            </Link>
            에 동의합니다 (필수)
          </span>
        </label>

        <button
          type="submit"
          disabled={pending || !agreed || !preferencesComplete}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? '가입 처리 중...' : '가입하고 시작하기'}
        </button>
        {error && <p className="text-center text-xs text-rose-500">{error}</p>}
      </form>
    </div>
  );
}
