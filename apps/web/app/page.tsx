import Link from 'next/link';
import Logo from '@/components/Logo';

export default function SplashPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-between bg-gradient-to-b from-indigo-50 via-white to-white px-6 py-16 text-center">
      <div />

      <div className="flex flex-col items-center gap-4">
        <Logo size="lg" />
        <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
          자물쇠도, 고민도 <span className="font-semibold text-indigo-600">탈탈</span> 털어드립니다.
          <br />
          실시간 방탈출 예약 검색부터 안전한 동행 매칭까지.
        </p>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/login"
          className="block w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          시작하기
        </Link>
        <Link
          href="/home"
          className="block w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50"
        >
          둘러보기
        </Link>
      </div>
    </div>
  );
}
