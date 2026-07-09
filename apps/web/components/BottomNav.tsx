'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/home', label: '검색', icon: '🔍' },
  { href: '/calendar', label: '마이캘린더', icon: '📅' },
  { href: '/recommendations', label: 'AI추천', icon: '✨' },
  { href: '/party', label: '동행매칭', icon: '🤝' },
  { href: '/profile', label: '프로필', icon: '👤' },
];

// 스플래시/로그인/회원가입은 진입 전 화면이라 하단 탭 없이 전체 화면으로 보여준다.
const HIDDEN_ON = ['/', '/login', '/signup'];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ON.includes(pathname)) return null;

  return (
    <nav className="sticky bottom-0 z-10 border-t border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {ITEMS.map((item) => {
          const section = '/' + item.href.split('/').filter(Boolean)[0];
          const active = pathname.startsWith(section);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
                active ? 'text-indigo-600' : 'text-zinc-400'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
