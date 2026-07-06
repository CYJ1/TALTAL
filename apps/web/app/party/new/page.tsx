import { notFound } from 'next/navigation';
import CreatePartyForm from '@/components/CreatePartyForm';
import { getThemeDetail } from '@/lib/data';

export default async function NewPartyPage({
  searchParams,
}: {
  searchParams: Promise<{ themeId?: string; time?: string; headcount?: string }>;
}) {
  const { themeId, time, headcount } = await searchParams;
  const theme = await getThemeDetail(themeId ?? 'confession');
  if (!theme) notFound();

  return (
    <div className="pb-8">
      <div className="border-b border-zinc-200 px-4 py-4">
        <p className="text-xs font-medium text-zinc-400">동행 파티 개설</p>
        <h1 className="text-lg font-bold text-zinc-900">안전 에스크로로 동행 구하기</h1>
      </div>
      <CreatePartyForm
        themeId={theme.themeId}
        themeName={theme.themeName}
        storeName={theme.storeName}
        capacityMin={theme.capacityMin}
        capacityMax={theme.capacityMax}
        defaultTime={time}
        defaultHeadcount={headcount ? Number(headcount) : theme.recommendedHeadcount?.recommended}
      />
    </div>
  );
}
