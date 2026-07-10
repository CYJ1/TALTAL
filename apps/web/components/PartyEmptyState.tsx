import Link from 'next/link';

export default function PartyEmptyState({ notFoundId }: { notFoundId?: string }) {
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl">🤝</div>
      <h1 className="mt-4 text-lg font-bold text-zinc-900">
        {notFoundId ? '이 동행 파티를 찾을 수 없어요' : '아직 참여 중인 동행 파티가 없어요'}
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        {notFoundId
          ? '링크가 만료됐거나 이미 마감된 파티일 수 있어요.'
          : '방탈출을 예약하고 동행을 구해보세요.'}
      </p>

      <div className="mt-6 w-full max-w-xs space-y-2">
        <Link
          href="/home"
          className="block w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          🔍 새 방탈출 예약해볼까요?
        </Link>
        <Link
          href="/party/new"
          className="block w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          🤝 혹은 동행을 찾아볼까요?
        </Link>
      </div>
    </div>
  );
}
