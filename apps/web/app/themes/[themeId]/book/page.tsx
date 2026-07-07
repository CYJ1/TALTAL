import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';
import { getThemeDetail, getThemeSlotsForDates } from '@/lib/data';

const BOOKING_WINDOW_DAYS = 7;

function upcomingDates(count: number): string[] {
  const today = new Date().toISOString().slice(0, 10);
  const start = new Date(`${today}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) =>
    new Date(start.getTime() + i * 86_400_000).toISOString().slice(0, 10),
  );
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ themeId: string }>;
}) {
  const { themeId } = await params;
  const theme = await getThemeDetail(themeId);
  if (!theme) notFound();

  const dates = upcomingDates(BOOKING_WINDOW_DAYS);
  const dateSlots = await getThemeSlotsForDates(theme.themeId, dates);

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
        dateSlots={dateSlots}
        capacityMin={theme.capacityMin}
        capacityMax={theme.capacityMax}
        recommendedHeadcount={theme.recommendedHeadcount?.recommended ?? theme.capacityMin}
      />
    </div>
  );
}
