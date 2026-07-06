export default function TagChip({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'accent' | 'warn' }) {
  const toneClass = {
    default: 'bg-zinc-100 text-zinc-600',
    accent: 'bg-indigo-50 text-indigo-700',
    warn: 'bg-amber-50 text-amber-700',
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${toneClass}`}>
      #{children}
    </span>
  );
}
