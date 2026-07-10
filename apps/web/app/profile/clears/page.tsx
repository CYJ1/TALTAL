import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserReviews } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

export default async function MyClearsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const reviews = await getUserReviews(sessionUser.id);
  const clears = reviews.filter((r) => r.cleared);

  return (
    <div className="space-y-4 px-4 py-4 pb-10">
      <div className="flex items-center gap-2">
        <Link href="/profile" className="text-lg text-zinc-500">
          ‹
        </Link>
        <h1 className="text-base font-bold text-zinc-900">Total 클리어 ({clears.length})</h1>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {clears.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-400">아직 클리어한 테마가 없어요.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {clears.map((review) => (
              <Link
                key={review.id}
                href={`/profile/reviews/${review.id}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-zinc-400">
                    {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {review.storeName} · {review.themeName}
                  </p>
                </div>
                <span className="shrink-0 text-zinc-300">›</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
