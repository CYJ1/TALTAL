'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loginAction } from '@/lib/actions';

const SOCIAL = [
  { id: 'kakao', label: '카카오로 계속하기', className: 'bg-[#FEE500] text-zinc-900', icon: '💬' },
  { id: 'naver', label: '네이버로 계속하기', className: 'bg-[#03C75A] text-white', icon: 'N' },
  { id: 'google', label: 'Google로 계속하기', className: 'border border-zinc-200 text-zinc-700', icon: 'G' },
] as const;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  not_configured: '아직 연동 준비 중인 로그인 방식입니다.',
  state_mismatch: '로그인 요청이 만료되었어요. 다시 시도해주세요.',
  server_error: '로그인 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  unknown_provider: '지원하지 않는 로그인 방식입니다.',
};

export default function LoginForm({ isRemoteMode }: { isRemoteMode: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const oauthErrorCode = searchParams.get('oauthError');
  const oauthError = oauthErrorCode
    ? (OAUTH_ERROR_MESSAGES[oauthErrorCode] ?? '소셜 로그인에 실패했습니다.')
    : null;

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
        {oauthError && <p className="text-center text-xs text-rose-500">{oauthError}</p>}
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-zinc-400">
        <div className="h-px flex-1 bg-zinc-200" />
        또는
        <div className="h-px flex-1 bg-zinc-200" />
      </div>

      <div className="space-y-2">
        {SOCIAL.map((s) =>
          isRemoteMode ? (
            <a
              key={s.id}
              href={`/api/oauth/${s.id}`}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium ${s.className}`}
            >
              <span>{s.icon}</span>
              {s.label}
            </a>
          ) : (
            <button
              key={s.id}
              type="button"
              disabled
              title="목업 모드에서는 지원하지 않습니다 (API_BASE_URL 설정 필요)"
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium opacity-50 ${s.className}`}
            >
              <span>{s.icon}</span>
              {s.label} (준비중)
            </button>
          ),
        )}
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
