import { redirect } from 'next/navigation';
import NicknameEditForm from '@/components/NicknameEditForm';
import { getProfile } from '@/lib/data';
import { getSessionUser } from '@/lib/session';

export default async function NicknamePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  const profile = await getProfile(sessionUser.id);
  return <NicknameEditForm currentNickname={profile.nickname} />;
}
