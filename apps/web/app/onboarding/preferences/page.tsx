import Link from 'next/link';
import Logo from '@/components/Logo';
import OnboardingPreferencesForm from '@/components/OnboardingPreferencesForm';

export default function OnboardingPreferencesPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="px-6 pt-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>
      <OnboardingPreferencesForm />
    </div>
  );
}
