'use client';

import { useRouter } from 'next/navigation';

/**
 * PWA 독립 실행 모드에서는 target="_blank" 링크가 새 탭이 아니라 같은 창 안에서
 * 열려버려(브라우저 크롬이 없어 새 탭을 띄울 대상이 없음), 뒤로가기 버튼 없이는
 * 이용약관 <-> 개인정보처리방침 사이를 빠져나갈 방법이 없다. 이 버튼이 그 탈출구다.
 */
export default function LegalPageBackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="mb-4 flex items-center gap-1 text-sm font-medium text-zinc-500"
    >
      ← 뒤로가기
    </button>
  );
}
