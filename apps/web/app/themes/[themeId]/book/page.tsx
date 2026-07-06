import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { getThemeDetail } from '@/lib/data';

export default async function BookPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = await getThemeDetail(themeId);
  if (!theme) notFound();

  return (
    <div className="pb-8">
      <div className="border-b border-zinc-200 px-4 py-4">
        <p className="text-xs font-medium text-zinc-400">예약하기</p>
        <h1 className="text-lg font-bold text-zinc-900">
          {theme.storeName} · {theme.themeName}
        </h1>
      </div>
      <BookingForm
        themeId={theme.themeId}
        slots={theme.slots}
        capacityMin={theme.capacityMin}
        capacityMax={theme.capacityMax}
        recommendedHeadcount={theme.recommendedHeadcount?.recommended ?? theme.capacityMin}
      />
    </div>
  );
}
