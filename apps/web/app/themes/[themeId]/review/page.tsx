import { notFound } from 'next/navigation';
import ReviewForm from '@/components/ReviewForm';
import { getThemeMeta } from '@/lib/data';

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = await getThemeMeta(themeId);
  if (!theme) notFound();

  return (
    <div className="px-4 py-4 pb-10">
      <h1 className="text-sm font-semibold text-zinc-500">간편 리뷰 & 일지 등록</h1>
      <p className="mt-0.5 text-lg font-bold text-zinc-900">
        {theme.storeName} · {theme.themeName}
      </p>
      <ReviewForm themeId={theme.themeId} />
    </div>
  );
}
