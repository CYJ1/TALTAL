export type OAuthProviderId = 'kakao' | 'naver' | 'google';

export interface OAuthProfile {
  providerId: string;
  email: string;
  nickname: string;
}

interface OAuthProviderConfig {
  clientIdEnv: string;
  clientSecretEnv: string; // 값이 비어 있으면(카카오/네이버는 선택) 요청에서 생략한다
  authorizeEndpoint: string;
  scope?: string;
  extraAuthorizeParams?: Record<string, string>;
  exchangeCode(args: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret: string;
  }): Promise<string>;
  fetchProfile(accessToken: string): Promise<OAuthProfile>;
}

async function postForm(url: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`OAuth token exchange failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body;
}

export const OAUTH_PROVIDERS: Record<OAuthProviderId, OAuthProviderConfig> = {
  kakao: {
    clientIdEnv: 'KAKAO_CLIENT_ID',
    clientSecretEnv: 'KAKAO_CLIENT_SECRET',
    authorizeEndpoint: 'https://kauth.kakao.com/oauth/authorize',
    async exchangeCode({ code, redirectUri, clientId, clientSecret }) {
      const body = await postForm('https://kauth.kakao.com/oauth/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
        ...(clientSecret ? { client_secret: clientSecret } : {}),
      });
      return body.access_token as string;
    },
    async fetchProfile(accessToken) {
      const res = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(`Kakao profile fetch failed: ${JSON.stringify(body)}`);
      const email = body.kakao_account?.email;
      if (!email) {
        throw new Error(
          '카카오 계정에서 이메일 제공에 동의하지 않았습니다. 카카오 개발자 콘솔에서 이메일 항목을 필수 동의로 설정해주세요.',
        );
      }
      return {
        providerId: String(body.id),
        email,
        nickname: body.kakao_account?.profile?.nickname ?? '카카오유저',
      };
    },
  },
  naver: {
    clientIdEnv: 'NAVER_CLIENT_ID',
    clientSecretEnv: 'NAVER_CLIENT_SECRET',
    authorizeEndpoint: 'https://nid.naver.com/oauth2.0/authorize',
    async exchangeCode({ code, redirectUri, clientId, clientSecret }) {
      const body = await postForm('https://nid.naver.com/oauth2.0/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      });
      return body.access_token as string;
    },
    async fetchProfile(accessToken) {
      const res = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (!res.ok || body.resultcode !== '00') {
        throw new Error(`Naver profile fetch failed: ${JSON.stringify(body)}`);
      }
      const profile = body.response;
      if (!profile?.email) {
        throw new Error('네이버 계정에서 이메일 정보를 가져오지 못했습니다.');
      }
      return {
        providerId: String(profile.id),
        email: profile.email,
        nickname: profile.nickname ?? '네이버유저',
      };
    },
  },
  google: {
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    authorizeEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    scope: 'openid email profile',
    async exchangeCode({ code, redirectUri, clientId, clientSecret }) {
      const body = await postForm('https://oauth2.googleapis.com/token', {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      });
      return body.access_token as string;
    },
    async fetchProfile(accessToken) {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(`Google profile fetch failed: ${JSON.stringify(body)}`);
      if (!body.email) {
        throw new Error('Google 계정에서 이메일 정보를 가져오지 못했습니다.');
      }
      return { providerId: String(body.id), email: body.email, nickname: body.name ?? 'Google유저' };
    },
  },
};

export function isOAuthProviderId(value: string): value is OAuthProviderId {
  return value === 'kakao' || value === 'naver' || value === 'google';
}
