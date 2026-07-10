'use client';

import type {
  ExperienceTier,
  GenerationPreference,
  GenreTag,
  HorrorRole,
  PacingPreference,
} from '@/lib/types';

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

export const EXPERIENCE_TIER_OPTIONS: { key: ExperienceTier; label: string }[] = [
  { key: 'TIER_10', label: '~10방' },
  { key: 'TIER_50', label: '~50방' },
  { key: 'TIER_100', label: '~100방' },
  { key: 'TIER_100_PLUS', label: '100방+' },
];

export interface PreferencesState {
  isBeginner: boolean | null;
  experienceTier: ExperienceTier | null;
  genrePreferences: GenreTag[];
  pacingPreference: PacingPreference | null;
  generationPreference: GenerationPreference | null;
  horrorRole: HorrorRole | null;
}

export function isPreferencesComplete(s: PreferencesState): boolean {
  const wantsHorror = s.genrePreferences.includes('HORROR_THRILLER');
  return (
    s.isBeginner === true ||
    (s.isBeginner === false &&
      s.experienceTier !== null &&
      s.genrePreferences.length > 0 &&
      s.pacingPreference !== null &&
      s.generationPreference !== null &&
      (!wantsHorror || s.horrorRole !== null))
  );
}

// 이메일 회원가입 폼과 소셜 로그인 온보딩 화면이 공유하는 선호도 입력 UI.
export default function PreferencesFields({
  state,
  onChange,
}: {
  state: PreferencesState;
  onChange: (next: PreferencesState) => void;
}) {
  const { isBeginner, experienceTier, genrePreferences, pacingPreference, generationPreference, horrorRole } = state;
  const wantsHorror = genrePreferences.includes('HORROR_THRILLER');

  function toggleGenre(genre: GenreTag) {
    const next = genrePreferences.includes(genre)
      ? genrePreferences.filter((g) => g !== genre)
      : [...genrePreferences, genre];
    onChange({
      ...state,
      genrePreferences: next,
      horrorRole: genre === 'HORROR_THRILLER' && genrePreferences.includes('HORROR_THRILLER') ? null : horrorRole,
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-3">
      <p className="mb-2 text-xs font-semibold text-zinc-500">방탈출, 처음이신가요?</p>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...state, isBeginner: true })}
          className={`rounded-xl border py-2.5 text-xs font-medium ${
            isBeginner === true ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-200 text-zinc-600'
          }`}
        >
          🐣 네, 방린이예요
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...state, isBeginner: false })}
          className={`rounded-xl border py-2.5 text-xs font-medium ${
            isBeginner === false ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-200 text-zinc-600'
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
            <p className="mb-2 text-xs font-semibold text-zinc-500">지금까지 몇 방 정도 클리어하셨나요?</p>
            <div className="grid grid-cols-4 gap-2">
              {EXPERIENCE_TIER_OPTIONS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => onChange({ ...state, experienceTier: t.key })}
                  className={`rounded-xl border py-2 text-xs font-medium ${
                    experienceTier === t.key
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-zinc-200 text-zinc-500'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

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
                  onClick={() => onChange({ ...state, pacingPreference: p.key })}
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
                  onClick={() => onChange({ ...state, generationPreference: g.key })}
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
                    onClick={() => onChange({ ...state, horrorRole: h.key })}
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
  );
}
