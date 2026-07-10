import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL, APP_BASE_URL } from '@/lib/config';
import { isOAuthProviderId, OAUTH_PROVIDERS } from '@/lib/oauth-providers';
import { OAUTH_STATE_COOKIE } from '@/lib/oauth-state';
import { setSessionCookie } from '@/lib/session';

function loginRedirect(error: string) {
  return NextResponse.redirect(new URL(`/login?oauthError=${error}`, APP_BASE_URL));
}

// 각 provider의 authorize 화면에서 로그인을 마친 사용자가 돌아오는 콜백.
// code를 provider의 access token으로 교환하고, 프로필(이메일 등)을 조회한 뒤
// NestJS의 POST /auth/social(내부 전용, x-internal-secret 헤더 필요)을 호출해
// 로그인/가입 처리하고 세션 쿠키를 발급한다.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  if (!isOAuthProviderId(provider)) {
    return loginRedirect('unknown_provider');
  }

  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');

  const store = await cookies();
  const expectedState = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginRedirect('state_mismatch');
  }

  const config = OAUTH_PROVIDERS[provider];
  const clientId = process.env[config.clientIdEnv];
  const clientSecret = process.env[config.clientSecretEnv] ?? '';
  if (!clientId) {
    return loginRedirect('not_configured');
  }

  try {
    const redirectUri = `${APP_BASE_URL}/api/oauth/${provider}/callback`;
    const accessToken = await config.exchangeCode({ code, redirectUri, clientId, clientSecret });
    const profile = await config.fetchProfile(accessToken);

    const res = await fetch(`${API_BASE_URL}/auth/social`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
      },
      body: JSON.stringify({
        provider: provider.toUpperCase(),
        providerId: profile.providerId,
        email: profile.email,
        nickname: profile.nickname,
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.message ?? `social login failed: ${res.status}`);
    }

    await setSessionCookie(body.accessToken);
    // 소셜 신규 가입은 이메일 가입과 달리 선호도 설문을 아직 안 거쳤으므로,
    // 온보딩 화면으로 보내 방린이 여부/장르 등을 채우게 한다.
    const destination = body.isNewUser ? '/onboarding/preferences' : '/home';
    return NextResponse.redirect(new URL(destination, APP_BASE_URL));
  } catch (err) {
    console.error(`[oauth:${provider}] callback failed`, err);
    return loginRedirect('server_error');
  }
}
