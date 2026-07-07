import Link from 'next/link';

export const metadata = {
  title: '이용약관 | 탈탈',
};

export default function TermsPage() {
  return (
    <div className="px-5 py-6 pb-12">
      <h1 className="text-lg font-bold text-zinc-900">이용약관</h1>
      <p className="mt-1 text-xs text-zinc-400">시행일자: [YYYY-MM-DD] · 최종 수정일: [YYYY-MM-DD]</p>

      <div className="prose mt-5 space-y-6 text-sm leading-relaxed text-zinc-700">
        <section>
          <h2 className="text-base font-bold text-zinc-900">제1조 (목적)</h2>
          <p className="mt-2">
            이 약관은 [회사명](이하 &quot;회사&quot;)이 제공하는 방탈출 통합 플랫폼 &quot;탈탈&quot;(이하 &quot;서비스&quot;)의
            이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을
            목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제2조 (용어의 정의)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li><strong>&quot;이용자&quot;</strong>란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원을 말합니다.</li>
            <li><strong>&quot;동행 매칭 파티&quot;</strong>란 이용자가 방탈출 예약 정원을 채우기 위해 다른 이용자를 모집하는 기능을 말합니다.</li>
            <li><strong>&quot;안전 예치금&quot;</strong>이란 동행 매칭 파티 참여 시 무단 노쇼를 방지하기 위해 참여자가 예치하는 금액으로, 정상적으로 플레이가 종료되면 참여자에게 반환됩니다.</li>
            <li><strong>&quot;매너온도&quot;</strong>란 이용자의 서비스 이용 태도를 수치화한 게이미피케이션 지표를 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제3조 (약관의 효력 및 변경)</h2>
          <p className="mt-2">
            회사는 이 약관의 내용을 이용자가 알 수 있도록 서비스 초기 화면에 게시합니다. 회사는
            관계 법령을 위반하지 않는 범위에서 이 약관을 개정할 수 있으며, 개정 시 적용일자 및
            개정사유를 명시하여 최소 7일 전(이용자에게 불리한 변경의 경우 30일 전) 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제4조 (회원가입)</h2>
          <p className="mt-2">
            이용자는 이메일 또는 소셜 로그인(카카오/네이버/Google)을 통해 회원가입을 신청하며,
            회사가 이를 승낙함으로써 회원가입이 완료됩니다. 이용자는 가입 시 정확한 정보를
            제공해야 하며, 허위 정보 기재로 인해 발생하는 불이익에 대해 회사는 책임지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제5조 (회원의 의무)</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>계정 정보(비밀번호 등)를 제3자에게 제공하거나 공유해서는 안 됩니다</li>
            <li>동행 매칭 파티 참여 후 정당한 사유 없이 예약 당일 무단으로 불참(노쇼)해서는 안 됩니다</li>
            <li>예약 완료 인증을 위해 허위 캡처본을 업로드하거나 타인의 예약 정보를 도용해서는 안 됩니다</li>
            <li>리뷰 작성 시 사실과 다른 내용을 게시하거나 타인을 비방하는 내용을 포함해서는 안 됩니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제6조 (안전 예치금 및 정산 특약)</h2>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            <li>동행 매칭 파티에 참여하는 이용자는 정원 기준으로 안분된 안전 예치금을 결제하며, 결제된 금액은 플레이 종료 시까지 홀딩(보관) 상태로 유지됩니다.</li>
            <li>예약된 일정에 모든 참여자가 정상적으로 플레이를 마친 경우, 홀딩된 예치금은 전액 참여자에게 반환됩니다.</li>
            <li>참여자가 정당한 사유 없이 예약 당일 불참한 것으로 확인(노쇼 신고 및 확인 절차)될 경우, 해당 참여자의 예치금은 몰수되어 다른 참여자에게 귀속되며, 매너온도가 하향 조정됩니다.</li>
            <li>노쇼 신고에 이의가 있는 경우, 이용자는 회사에 이의를 제기할 수 있으며 회사는 관련 증빙을 확인해 재정산할 수 있습니다.</li>
            <li>예치금의 결제 및 정산은 전자결제대행사(PG사)를 통해 처리되며, 회사는 결제 실패·지연에 대해 전자결제대행사와 협력하여 해결합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제7조 (리뷰 콘텐츠의 저작권)</h2>
          <p className="mt-2">
            이용자가 서비스 내에 작성한 리뷰, 코멘트 등 콘텐츠의 저작권은 해당 이용자에게
            귀속됩니다. 다만 이용자는 회사가 서비스의 운영·홍보·AI 추천 엔진 학습 목적으로
            해당 콘텐츠를 무상으로 사용할 수 있도록 허락합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제8조 (서비스 이용의 제한 및 중지)</h2>
          <p className="mt-2">
            회사는 이용자가 제5조의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 사전
            통지 없이 서비스 이용을 제한하거나 회원자격을 정지·상실시킬 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제9조 (면책조항)</h2>
          <p className="mt-2">
            회사는 방탈출 매장의 실제 예약 가능 여부, 테마 운영 상태 등 매장 측 사정으로 발생하는
            문제에 대해 직접적인 책임을 지지 않으며, 이용자 간 동행 매칭 과정에서 발생하는 분쟁에
            대해서는 안전 예치금 정산 절차를 통해 중재하되 최종 책임은 당사자 간 해결을 원칙으로
            합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">제10조 (분쟁해결 및 준거법)</h2>
          <p className="mt-2">
            이 약관과 관련하여 회사와 이용자 간 발생한 분쟁에 대해서는 대한민국 법을 준거법으로
            하며, 관할법원은 민사소송법상의 관할법원으로 합니다.
          </p>
        </section>
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-4">
        <Link href="/legal/privacy" className="text-sm font-medium text-indigo-600 underline">
          개인정보처리방침 보기 →
        </Link>
      </div>
    </div>
  );
}
