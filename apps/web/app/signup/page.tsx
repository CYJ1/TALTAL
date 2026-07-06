import Link from 'next/link';
import Logo from '@/components/Logo';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="px-6 pt-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>
      <SignupForm />
    </div>
  );
}
