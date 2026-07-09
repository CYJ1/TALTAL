'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signupAction } from '@/lib/actions';
import type { GenerationPreference, GenreTag, HorrorRole, PacingPreference } from '@/lib/types';

// 이용약관/개인정보처리방침 보기 -> 뒤로가기로 돌아왔을 때 작성 중이던 내용이
// 날아가지 않도록 sessionStorage에 임시 저장한다 (탭을 닫으면 사라짐).
// 비밀번호는 보안상 저장하지 않는다 — 뒤로가기 후 비밀번호만 다시 입력하면 된다.
const DRAFT_KEY = 'taltal-signup-draft';

interface SignupDraft {
  nickname: string;
  email: string;
  isBeginner: boolean | null;
  genrePreferences: GenreTag[];
  pacingPreference: PacingPreference | null;
  generationPreference: GenerationPreference | null;
  horrorRole: HorrorRole | null;
  agreed: boolean;
}

function loadDraft(): SignupDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as SignupDraft) : null;
  } catch {
    return null;
  }
}

// 한국 방탈출 어워즈 시상 부문 기준 6개 장르 분류
const GENRE_OPTIONS: { key: GenreTag; label: string }[] = [
  { key: 'HORROR_THRILLER', label: '공포/스릴러' },
  { key: 'EMOTIONAL_ROMANCE', label: '감성/드라마/로맨스' },
  { key: 'MYSTERY_DETECTIVE', label: '추리/미스터리' },
  { key: 'ACTION_ADVENTURE', label: '액션/어드벤처' },
  { key: 'SCIFI_FANTASY', label: 'SF/판타지' },
  { key: 'COMEDY_ETC', label: '코믹/문제/기타' },
];

const PACING_OPTIONS: { key: PacingPreference; label: string }[] = [
  { key: 'STORY', label: '스토리위주' },
  { key: 'SPEED', label: '문제 빨리 풀기 위주' },
];

const GENERATION_OPTIONS: { key: GenerationPreference; label: string; desc: string }[] = [
  { key: 'GEN1', label: '1세대', desc: '자물쇠·퀴즈 위주' },
  { key: 'GEN2', label: '2세대', desc: '장치·센서 위주' },
  { key: 'GEN3', label: '3세대', desc: '이머시브·앱연동' },
];

const HORROR_ROLE_OPTIONS: { key: HorrorRole; label: string; desc: string }[] = [
  { key: 'SCARED', label: '😱 쫄', desc: '무서운 건 무서운 거다' },
  { key: 'PUSH_THROUGH', label: '😨 전진쫄', desc: '무섭지만 일단 앞장선다' },
  { key: 'TANK', label: '💪 탱커', desc: '공포엔 안 쫄림' },
];

export default function SignupForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState(() => loadDraft()?.nickname ?? '');
  const [email, setEmail] = useState(() => loadDraft()?.email ?? '');
  const [password, setPassword] = useState('');

  const [isBeginner, setIsBeginner] = useState<boolean | null>(() => loadDraft()?.isBeginner ?? null);
  const [genrePreferences, setGenrePreferences] = useState<GenreTag[]>(() => loadDraft()?.genrePreferences ?? []);
  const [pacingPreference, setPacingPreference] = useState<PacingPreference | null>(
    () => loadDraft()?.pacingPreference ?? null,
  );
  const [generationPreference, setGenerationPreference] = useState<GenerationPreference | null>(
    () => loadDraft()?.generationPreference ?? null,
  );
  const [horrorRole, setHorrorRole] = useState<HorrorRole | null>(() => loadDraft()?.horrorRole ?? null);

  const [agreed, setAgreed] = useState(() => loadDraft()?.agreed ?? false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft: SignupDraft = {
      nickname,
      email,
      isBeginner,
      genrePreferences,
      pacingPreference,
      generationPreference,
      horrorRole,
      agreed,
    };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [nickname, email, isBeginner, genrePreferences, pacingPreference, generationPreference, horrorRole, agreed]);

  const wantsHorror = genrePreferences.includes('HORROR_THRILLER');
  const preferencesComplete =
    isBeginner === true ||
    (isBeginner === false &&
      genrePreferences.length > 0 &&
      pacingPreference !== null &&
      generationPreference !== null &&
      (!wantsHorror || horrorRole !== null));

  function toggleGenre(genre: GenreTag) {
    setGenrePreferences((prev) => {
      const next = prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre];
      if (genre === 'HORROR_THRILLER' && prev.includes('HORROR_THRILLER')) setHorrorRole(null);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signupAction({
        email,
        password,
        nickname,
        isBeginner: isBeginner ?? false,
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

        <div className="rounded-2xl border border-zinc-200 p-3">
          <p className="mb-2 text-xs font-semibold text-zinc-500">방탈출, 처음이신가요?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setIsBeginner(true)}
              className={`rounded-xl border py-2.5 text-xs font-medium ${
                isBeginner === true
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-zinc-200 text-zinc-600'
              }`}
            >
              🐣 네, 방린이예요
            </button>
            <button
              type="button"
              onClick={() => setIsBeginner(false)}
              className={`rounded-xl border py-2.5 text-xs font-medium ${
                isBeginner === false
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-zinc-200 text-zinc-600'
              }`}
            >
              🔑 아니요, 경험 있어요
            </button>
          </div>

          {isBeginner === true && (
            <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-center text-xs font-medium text-indigo-700">
              방린이시군요! 편하게 시작해봐요 🐣 취향은 플레이하면서 천천히 찾아가면 돼요.
            </p>
          )}

          {isBeginner === false && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-500">선호 장르 (복수 선택 가능)</p>
                <div className="grid grid-cols-2 gap-2">
                  {GENRE_OPTIONS.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => toggleGenre(g.key)}
                      className={`rounded-xl border py-2 text-xs font-medium ${
                        genrePreferences.includes(g.key)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 text-zinc-500'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-500">진행 스타일</p>
                <div className="grid grid-cols-2 gap-2">
                  {PACING_OPTIONS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPacingPreference(p.key)}
                      className={`rounded-xl border py-2 text-xs font-medium ${
                        pacingPreference === p.key
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 text-zinc-500'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-zinc-500">선호 세대</p>
                <div className="grid grid-cols-3 gap-2">
                  {GENERATION_OPTIONS.map((g) => (
                    <button
                      key={g.key}
                      type="button"
                      onClick={() => setGenerationPreference(g.key)}
                      className={`rounded-xl border p-2 text-center text-xs ${
                        generationPreference === g.key
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-zinc-200 text-zinc-500'
                      }`}
                    >
                      <div className="font-semibold">{g.label}</div>
                      <div className="mt-0.5 text-[10px] leading-tight">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {wantsHorror && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-zinc-500">공포 앞에서 나는?</p>
                  <div className="grid grid-cols-3 gap-2">
                    {HORROR_ROLE_OPTIONS.map((h) => (
                      <button
                        key={h.key}
                        type="button"
                        onClick={() => setHorrorRole(h.key)}
                        className={`rounded-xl border p-2 text-center text-xs ${
                          horrorRole === h.key
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                            : 'border-zinc-200 text-zinc-500'
                        }`}
                      >
                        <div className="font-semibold">{h.label}</div>
                        <div className="mt-0.5 text-[10px] leading-tight">{h.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

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
