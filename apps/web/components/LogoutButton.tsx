'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push('/')}
      className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
    >
      로그아웃
    </button>
  );
}
