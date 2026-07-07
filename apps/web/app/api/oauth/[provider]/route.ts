import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { APP_BASE_URL } from '@/lib/config';
import { isOAuthProviderId, OAUTH_PROVIDERS } from '@/lib/oauth-providers';
import { OAUTH_STATE_COOKIE } from '@/lib/oauth-state';

// 소셜 로그인 시작점: provider의 인가(authorize) 화면으로 리다이렉트한다.
// (카카오/네이버/구글 개발자 콘솔에 앱을 등록하고 클라이언트 ID를 발급받아야
// 실제로 동작한다 — 미설정 시 /login으로 안전하게 되돌아간다.)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isOAuthProviderId(provider)) {
    return NextResponse.redirect(new URL('/login?oauthError=unknown_provider', APP_BASE_URL));
  }

  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv];
  if (!clientId) {
    return NextResponse.redirect(
      new URL(`/login?oauthError=not_configured&provider=${provider}`, APP_BASE_URL),
    );
  }

  const state = crypto.randomUUID();
  const redirectUri = `${APP_BASE_URL}/api/oauth/${provider}/callback`;

  const authorizeUrl = new URL(config.authorizeEndpoint);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('state', state);
  if (config.scope) authorizeUrl.searchParams.set('scope', config.scope);

  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 5,
  });

  return NextResponse.redirect(authorizeUrl);
}
