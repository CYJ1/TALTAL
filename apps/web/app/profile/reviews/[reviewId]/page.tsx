import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { GRADE_STYLE } from '@/components/ReviewCard';
import { getUserReview } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

function formatRemaining(remainingSec: number) {
  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  return `${m}분 ${String(s).padStart(2, '0')}초`;
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const { reviewId } = await params;
  const review = await getUserReview(sessionUser.id, reviewId);
  if (!review) notFound();

  return (
    <div className="space-y-4 px-4 py-4 pb-10">
      <div className="flex items-center gap-2">
        <Link href="/profile/reviews" className="text-lg text-zinc-500">
          ‹
        </Link>
        <h1 className="text-base font-bold text-zinc-900">내 리뷰</h1>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-900">{review.storeName}</p>
            <p className="text-base font-bold text-zinc-900">{review.themeName}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              GRADE_STYLE[review.grade] ?? 'bg-zinc-100 text-zinc-600'
            }`}
          >
            {review.grade}
          </span>
        </div>

        <p className="mt-2 text-xs text-zinc-400">
          {new Date(review.createdAt).toLocaleDateString('ko-KR')} 작성
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-zinc-50 py-2">
            <p className="font-semibold text-zinc-900">{review.cleared ? '클리어' : '실패'}</p>
            <p className="text-zinc-400">결과</p>
          </div>
          <div className="rounded-lg bg-zinc-50 py-2">
            <p className="font-semibold text-zinc-900">{formatRemaining(review.remainingSec)}</p>
            <p className="text-zinc-400">잔여시간</p>
          </div>
          <div className="rounded-lg bg-zinc-50 py-2">
            <p className="font-semibold text-zinc-900">{review.hintsUsed}회</p>
            <p className="text-zinc-400">힌트 사용</p>
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500">체감 추천인원 {review.votedHeadcount}인</p>

        {review.selectedTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {review.selectedTags.map((tag) => (
              <span key={tag} className="rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {review.comment && (
          <p className="mt-3 whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700">
            {review.comment}
          </p>
        )}

        <Link
          href={`/themes/${review.themeId}`}
          className="mt-4 block rounded-xl border border-zinc-200 py-2.5 text-center text-xs font-medium text-zinc-500"
        >
          이 테마 다시 보기
        </Link>
      </section>
    </div>
  );
}
