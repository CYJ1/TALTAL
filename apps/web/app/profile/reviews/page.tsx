import Link from 'next/link';
import { redirect } from 'next/navigation';
import ReviewCard from '@/components/ReviewCard';
import { getUserReviews } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

export default async function MyReviewsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const reviews = await getUserReviews(sessionUser.id);

  return (
    <div className="space-y-4 px-4 py-4 pb-10">
      <div className="flex items-center gap-2">
        <Link href="/profile" className="text-lg text-zinc-500">
          ‹
        </Link>
        <h1 className="text-base font-bold text-zinc-900">내가 쓴 리뷰 ({reviews.length})</h1>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        {reviews.length === 0 ? (
          <p className="py-6 text-center text-xs text-zinc-400">아직 작성한 리뷰가 없어요.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
