export const PAYMENT_ADAPTER = Symbol('PAYMENT_ADAPTER');

export interface HoldResult {
  txRef: string;
}

/**
 * 포트원(PortOne) 에스크로 대금 보호(Holding) 트랜잭션 어댑터 계약.
 * 실연동 시 이 인터페이스를 구현하는 PortoneLiveAdapter로 DI 토큰만 교체하면 된다.
 */
export interface PaymentAdapter {
  holdDeposit(params: { partyId: string; userId: string; amountWon: number }): Promise<HoldResult>;
  release(txRef: string): Promise<void>;
  forfeit(txRef: string): Promise<void>;
}
