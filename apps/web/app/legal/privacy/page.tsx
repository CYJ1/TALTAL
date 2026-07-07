import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 | 탈탈',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="px-5 py-6 pb-12">
      <h1 className="text-lg font-bold text-zinc-900">개인정보처리방침</h1>
      <p className="mt-1 text-xs text-zinc-400">시행일자: [YYYY-MM-DD] · 최종 수정일: [YYYY-MM-DD]</p>

      <div className="prose mt-5 space-y-6 text-sm leading-relaxed text-zinc-700">
        <p>
          [회사명](&quot;회사&quot;)은(는) 「개인정보 보호법」 등 관련 법령을 준수하며, 이용자의 개인정보를
          안전하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다. 회사는 방탈출
          통합 플랫폼 &quot;탈탈&quot;(이하 &quot;서비스&quot;)을 통해 실시간 예약 검색, 게이미피케이션 스탯, 리뷰,
          안전 에스크로 동행 매칭, AI 추천 기능을 제공합니다.
        </p>

        <section>
          <h2 className="text-base font-bold text-zinc-900">1. 수집하는 개인정보 항목 및 수집방법</h2>
          <p className="mt-2 font-semibold text-zinc-800">가. 회원가입 및 로그인</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>이메일 회원가입: 이메일 주소, 비밀번호(암호화 저장), 닉네임</li>
            <li>
              소셜 로그인(카카오/네이버/Google): 각 서비스 제공자로부터 제공받는 이메일 또는 내부
              식별용 계정 ID, 닉네임. 카카오의 경우 사업자 인증 전에는 이메일 제공에 동의하지
              않을 수 있으며, 이 경우 이메일 없이 내부 식별값만으로 계정을 생성합니다.
            </li>
          </ul>
          <p className="mt-3 font-semibold text-zinc-800">나. 서비스 이용 과정에서 생성·수집되는 정보</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>예약/플레이 이력, 리뷰 내용(테마 평가, 선택 태그, 코멘트), 게이미피케이션 스탯(육각 능력치, 매너온도, 레벨)</li>
            <li>동행 매칭 파티 개설·참여 이력, 안전 예치금(에스크로) 결제·정산 내역, 노쇼(무단 불참) 신고 이력</li>
            <li>예약 완료 화면 캡처 이미지(OCR 인증용) — 인증 처리 후 원본 이미지는 최소한의 기간만 보관 후 파기</li>
            <li>서비스 이용 기록, 접속 로그, 접속 IP, 쿠키, 기기정보(OS, 브라우저 종류)</li>
          </ul>
          <p className="mt-3 font-semibold text-zinc-800">다. 결제 관련 정보</p>
          <p className="mt-1">
            안전 예치금 결제는 전자결제대행업체(PG사)를 통해 처리되며, 회사는 카드번호 등 결제수단
            정보를 직접 저장하지 않습니다. 결제 성공/실패 여부, 거래 고유번호(트랜잭션 참조값),
            결제금액만 보관합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">2. 개인정보의 수집 및 이용목적</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>회원 가입의사 확인, 본인 식별·인증, 회원 자격 유지·관리</li>
            <li>실시간 예약 정보 검색 및 추천 서비스 제공</li>
            <li>리뷰 데이터 기반 게이미피케이션 스탯 산출 및 AI 추천 엔진 학습</li>
            <li>동행 매칭 파티의 안전한 운영 — 예치금 보관(홀딩) 및 정산, 무단 노쇼자에 대한 페널티(매너온도 조정, 예치금 귀속) 처리</li>
            <li>예약 완료 인증(OCR)을 통한 허위/리셀 룸 방지</li>
            <li>서비스 부정이용 방지, 민원 처리, 공지사항 전달</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">3. 개인정보의 보유 및 이용기간</h2>
          <p className="mt-2">
            회사는 원칙적으로 개인정보 수집·이용목적이 달성된 후에는 해당 정보를 지체 없이
            파기합니다. 다만 관계 법령에 따라 보존할 필요가 있는 경우 회사는 아래와 같이 관계
            법령에서 정한 일정한 기간 동안 회원정보를 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
            <li>예약 완료 인증용 업로드 이미지: 인증 처리 완료 후 최대 30일 이내 파기</li>
            <li>웹사이트 방문기록(접속 로그, 접속 IP): 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">4. 개인정보의 제3자 제공</h2>
          <p className="mt-2">
            회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 아래의 경우는
            예외로 합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            <li>
              동행 매칭 파티 참여 시, 같은 파티에 참여한 다른 이용자에게 닉네임, 매너온도, 육각
              스탯 요약 정보가 공개됩니다 (파티 시너지 확인 목적, 이메일 등 식별정보는 비공개)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">5. 개인정보처리 위탁</h2>
          <p className="mt-2">회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-semibold">수탁업체</th>
                  <th className="px-3 py-2 font-semibold">위탁업무 내용</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="px-3 py-2">포트원(PortOne) 등 전자결제대행사</td>
                  <td className="px-3 py-2">안전 예치금 결제·에스크로 처리</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">네이버 클라우드플랫폼(CLOVA OCR)</td>
                  <td className="px-3 py-2">예약 완료 캡처본 OCR 인증</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">[클라우드 인프라 사업자]</td>
                  <td className="px-3 py-2">서버 호스팅 및 데이터베이스 운영</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            ※ 위 수탁업체는 서비스 정식 연동 완료 후 확정되며, 변경 시 본 방침을 통해 고지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">6. 정보주체의 권리·의무 및 행사방법</h2>
          <p className="mt-2">
            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며, 회원 탈퇴를 통해
            개인정보의 수집·이용 동의를 철회할 수 있습니다. 다만 진행 중인 동행 매칭 파티에
            예치금이 홀딩되어 있는 경우, 정산이 완료된 이후 탈퇴가 처리될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">7. 개인정보의 파기절차 및 방법</h2>
          <p className="mt-2">
            전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여
            삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">8. 개인정보의 안전성 확보조치</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>비밀번호는 복호화가 불가능한 일방향 암호화(bcrypt) 방식으로 저장됩니다</li>
            <li>로그인 세션은 만료 기한이 있는 토큰(JWT) 및 httpOnly 쿠키로 관리되어 스크립트로 탈취될 수 없습니다</li>
            <li>결제수단 정보는 회사 서버에 저장하지 않고 전자결제대행사를 통해서만 처리됩니다</li>
            <li>개인정보에 대한 접근 권한을 최소한의 인원으로 제한하고 있습니다</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">9. 쿠키(Cookie)의 운용</h2>
          <p className="mt-2">
            회사는 로그인 상태 유지를 위해 세션 쿠키를 사용합니다. 이 쿠키는 로그인 인증 목적으로만
            사용되는 필수 쿠키로, 브라우저 설정을 통해 저장을 거부할 수 있으나 이 경우 로그인이
            필요한 일부 서비스 이용에 제약이 있을 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">10. 개인정보 보호책임자</h2>
          <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <p>성명: [담당자명]</p>
            <p>직책: [직책]</p>
            <p>연락처: [이메일 / 전화번호]</p>
          </div>
          <p className="mt-2">
            이용자는 서비스를 이용하면서 발생한 모든 개인정보 관련 문의, 불만 처리를 개인정보
            보호책임자에게 문의하실 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-zinc-900">11. 고지의 의무</h2>
          <p className="mt-2">
            현 개인정보처리방침은 관련 법령, 회사 정책 또는 보안기술의 변경에 따라 내용의 추가·삭제
            및 수정이 있을 수 있으며, 변경 시 서비스 내 공지사항을 통해 고지합니다.
          </p>
        </section>
      </div>

      <div className="mt-8 border-t border-zinc-100 pt-4">
        <Link href="/legal/terms" className="text-sm font-medium text-indigo-600 underline">
          이용약관 보기 →
        </Link>
      </div>
    </div>
  );
}
