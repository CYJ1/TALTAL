'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/lib/actions';

const SOCIAL = [
  { label: '카카오로 계속하기', className: 'bg-[#FEE500] text-zinc-900', icon: '💬' },
  { label: '네이버로 계속하기', className: 'bg-[#03C75A] text-white', icon: 'N' },
  { label: 'Google로 계속하기', className: 'border border-zinc-200 text-zinc-700', icon: 'G' },
];

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await loginAction({ email, password });
      router.push('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
      setPending(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-10">
      <h1 className="text-xl font-bold text-zinc-900">다시 오셨네요 👋</h1>
      <p className="mt-1 text-sm text-zinc-500">탈탈 계정으로 로그인하세요.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
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
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? '로그인 중...' : '로그인'}
        </button>
        {error && <p className="text-center text-xs text-rose-500">{error}</p>}
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        또는
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="space-y-2">
        {SOCIAL.map((s) => (
          <button
            key={s.label}
            type="button"
            disabled
            title="준비 중인 기능입니다"
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium opacity-50 ${s.className}`}
          >
            <span>{s.icon}</span>
            {s.label} (준비중)
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-zinc-500">
        아직 계정이 없으신가요?{' '}
        <Link href="/signup" className="font-semibold text-indigo-600">
          회원가입
        </Link>
      </p>
    </div>
  );
}
