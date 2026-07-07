import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HoldResult, PaymentAdapter } from './payment-adapter.interface';

/**
 * 실제 포트원(PortOne) API 키/가맹점 정보가 없는 개발 단계용 목업 구현체.
 * 실제 홀딩/정산은 발생하지 않으며, 트랜잭션 참조값만 발급하고 인메모리 상태를
 * 로깅한다. 실연동 시 PAYMENT_ADAPTER 토큰의 provider를 이 클래스에서
 * Portone SDK를 사용하는 실제 어댑터로 교체하면 나머지 party 도메인 로직은
 * 변경할 필요가 없다.
 */
@Injectable()
export class PortoneMockAdapter implements PaymentAdapter {
  private readonly logger = new Logger('PortoneMockAdapter(MOCK)');

  async holdDeposit(params: {
    partyId: string;
    userId: string;
    amountWon: number;
  }): Promise<HoldResult> {
    const txRef = `mock_portone_${randomUUID()}`;
    this.logger.log(
      `[MOCK] Hold ${params.amountWon}원 for user=${params.userId} party=${params.partyId} -> ${txRef}`,
    );
    return { txRef };
  }

  async release(txRef: string): Promise<void> {
    this.logger.log(`[MOCK] Release escrow hold ${txRef}`);
  }

  async forfeit(txRef: string): Promise<void> {
    this.logger.log(
      `[MOCK] Forfeit escrow hold ${txRef} -> transferred to host as penalty`,
    );
  }
}
