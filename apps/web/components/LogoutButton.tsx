import { logoutAction } from '@/lib/actions';

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="w-full rounded-xl border border-rose-200 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50"
      >
        로그아웃
      </button>
    </form>
  );
}
