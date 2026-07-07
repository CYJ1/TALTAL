'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupAction } from '@/lib/actions';

const PERSONALITY = [
  { key: 'tank', label: '🛡 탱커', desc: '문제보다 몸이 먼저 나간다' },
  { key: 'solver', label: '🧠 해결사', desc: '장치 앞에선 내가 최고' },
  { key: 'story', label: '📖 스토리러', desc: '연출과 서사를 즐긴다' },
];

export default function SignupForm() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [personality, setPersonality] = useState('tank');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signupAction({ email, password, nickname });
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

        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-500">나의 방탈출 성향은?</p>
          <div className="grid grid-cols-3 gap-2">
            {PERSONALITY.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPersonality(p.key)}
                className={`rounded-xl border p-2 text-center text-xs ${
                  personality === p.key
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-zinc-200 text-zinc-500'
                }`}
              >
                <div className="font-semibold">{p.label}</div>
                <div className="mt-0.5 text-[10px] leading-tight">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? '가입 처리 중...' : '가입하고 시작하기'}
        </button>
        {error && <p className="text-center text-xs text-rose-500">{error}</p>}
      </form>
    </div>
  );
}
