import { redirect } from 'next/navigation';
import ManualLogEntry from '@/components/ManualLogEntry';
import { getSessionUser } from '@/lib/session';

export default async function ManualLogPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect('/login');
  return <ManualLogEntry />;
}
