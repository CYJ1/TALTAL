import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getThemeDetail } from '@/lib/data';

export default async function BookCompletePage({
  params,
  searchParams,
}: {
  params: Promise<{ themeId: string }>;
  searchParams: Promise<{ date?: string; time?: string; headcount?: string }>;
}) {
  const { themeId } = await params;
  const { date, time, headcount } = await searchParams;
  const theme = await getThemeDetail(themeId);
  if (!theme) notFound();

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl">✅</div>
      <h1 className="mt-4 text-xl font-bold text-zinc-900">예약이 확정되었습니다!</h1>
      <p className="mt-1 text-sm text-zinc-500">공홈 예약이 완료된 것으로 가정한 데모 화면입니다.</p>

      <div className="mt-6 w-full max-w-xs rounded-2xl border border-zinc-200 bg-white p-4 text-left text-sm shadow-sm">
        <p className="font-semibold text-zinc-900">
          {theme.storeName} · {theme.themeName}
        </p>
        <div className="mt-2 space-y-1 text-zinc-500">
          <p>
            📅 날짜{' '}
            <span className="float-right font-medium text-zinc-900">
              {date
                ? new Intl.DateTimeFormat('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                    timeZone: 'UTC',
                  }).format(new Date(`${date}T00:00:00Z`))
                : '-'}
            </span>
          </p>
          <p>
            🕐 시간 <span className="float-right font-medium text-zinc-900">{time ?? '-'}</span>
          </p>
          <p>
            👥 인원 <span className="float-right font-medium text-zinc-900">{headcount ?? '-'}인</span>
          </p>
        </div>
      </div>

      <div className="mt-6 w-full max-w-xs space-y-2">
        <Link
          href={`/party/new?themeId=${themeId}&time=${time ?? ''}&headcount=${headcount ?? ''}`}
          className="block w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          🤝 동행 파티 만들기
        </Link>
        <Link
          href="/home"
          className="block w-full rounded-xl border border-zinc-200 py-3 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
