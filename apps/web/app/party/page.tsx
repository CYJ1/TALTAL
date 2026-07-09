import { redirect } from 'next/navigation';
import PartyEmptyState from '@/components/PartyEmptyState';
import { getSessionUser } from '@/lib/session';

// 하단 탭 "동행매칭"의 기본 진입점. 특정 파티로 바로 연결되는 링크는
// /party/[id]로 공유되고, 이 화면은 아직 참여 중인 파티가 없을 때의 랜딩이다.
export default async function PartyLandingPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');

  return <PartyEmptyState />;
}
