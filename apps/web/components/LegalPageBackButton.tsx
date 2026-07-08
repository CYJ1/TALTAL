'use client';

import { useRouter } from 'next/navigation';

/**
 * 이용약관 <-> 개인정보처리방침 사이를 빠져나가는 뒤로가기 버튼.
 * 즐겨찾기/딥링크 등으로 이 페이지가 브라우저 세션의 첫 항목이 되어버리면
 * router.back()이 갈 곳이 없어 아무 반응이 없다 — 짧은 지연 후 URL이 그대로면
 * 안전한 기본 경로로 대신 이동한다.
 */
export default function LegalPageBackButton() {
  const router = useRouter();

  function handleClick() {
    const before = window.location.pathname;
    router.back();
    window.setTimeout(() => {
      if (window.location.pathname === before) {
        router.push('/home');
      }
    }, 250);
  }

  return (
    <button
      onClick={handleClick}
      className="mb-4 flex items-center gap-1 text-sm font-medium text-zinc-500"
    >
      ← 뒤로가기
    </button>
  );
}
