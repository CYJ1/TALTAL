import { NextRequest, NextResponse } from 'next/server';
import { IS_REMOTE_MODE } from './lib/config';
import { SESSION_COOKIE } from './lib/session';

const PROTECTED_PREFIXES = [
  '/calendar',
  '/profile',
  '/recommendations',
  '/notifications',
  '/party',
  '/onboarding',
];
const PROTECTED_SEGMENTS = ['/review']; // /themes/[themeId]/review
const AUTH_PAGES = ['/login', '/signup'];

// 이 Proxy는 UX용 게이트일 뿐이다. 실제 인가는 각 API 호출 시점에
// NestJS의 JwtAuthGuard(또는 각 라우트 핸들러)가 토큰을 검증하며 수행한다.
export function proxy(req: NextRequest) {
  if (!IS_REMOTE_MODE) return NextResponse.next(); // 목업 모드는 로그인 없이 전체 화면 데모 허용

  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected =
    PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    (pathname.startsWith('/themes/') && PROTECTED_SEGMENTS.some((s) => pathname.includes(s)));
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const isAuthPage = AUTH_PAGES.some((p) => pathname === p);
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/home', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
