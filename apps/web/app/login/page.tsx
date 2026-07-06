import Link from 'next/link';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="px-6 pt-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>
      <LoginForm />
    </div>
  );
}
