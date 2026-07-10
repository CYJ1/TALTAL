import Link from 'next/link';
import type { UserReview } from '@/lib/types';

// 흙길(최하) < 풀길 < 풀꽃길 < 꽃길 < 꽃밭길 < 인생테마(최상) 순
const GRADE_STYLE: Record<string, string> = {
  흙길: 'bg-rose-50 text-rose-600',
  풀길: 'bg-zinc-100 text-zinc-600',
  풀꽃길: 'bg-lime-50 text-lime-700',
  꽃길: 'bg-emerald-50 text-emerald-700',
  꽃밭길: 'bg-teal-50 text-teal-700',
  인생테마: 'bg-amber-50 text-amber-700',
};

export default function ReviewCard({ review }: { review: UserReview }) {
  return (
    <Link href={`/profile/reviews/${review.id}`} className="block py-3 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between">
        <p className="truncate text-sm font-semibold text-zinc-900">
          {review.storeName} · {review.themeName}
        </p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            GRADE_STYLE[review.grade] ?? 'bg-zinc-100 text-zinc-600'
          }`}
        >
          {review.grade}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {review.selectedTags.map((tag) => (
          <span key={tag} className="rounded-full bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-500">
            #{tag}
          </span>
        ))}
      </div>
      {review.comment && <p className="mt-1.5 line-clamp-2 text-xs text-zinc-500">{review.comment}</p>}
      <p className="mt-1 text-[11px] text-zinc-400">
        {new Date(review.createdAt).toLocaleDateString('ko-KR')} · 체감 {review.votedHeadcount}인
        {review.cleared ? ' · 클리어' : ' · 실패'}
      </p>
    </Link>
  );
}

export { GRADE_STYLE };
