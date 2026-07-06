export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const textSize = { sm: 'text-base', md: 'text-2xl', lg: 'text-4xl' }[size];
  const iconSize = { sm: 'text-lg', md: 'text-3xl', lg: 'text-5xl' }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 font-extrabold tracking-tight text-zinc-900 ${textSize}`}>
      <span className={iconSize}>🔓</span>
      탈탈
    </span>
  );
}
