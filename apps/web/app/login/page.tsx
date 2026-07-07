import { Suspense } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import LoginForm from '@/components/LoginForm';
import { IS_REMOTE_MODE } from '@/lib/config';

// API_BASE_URL은 Docker 이미지 build 시점이 아니라 컨테이너 실행 시점의 환경변수다.
// 이 페이지가 정적으로 미리 렌더링되면 build 시점 값(항상 미설정 = 목업 모드)이
// 굳어버려 소셜 로그인 버튼 노출 여부가 실제 배포 설정과 어긋나므로 매 요청마다 다시 렌더링한다.
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <div className="px-6 pt-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>
      <Suspense>
        <LoginForm isRemoteMode={IS_REMOTE_MODE} />
      </Suspense>
    </div>
  );
}
