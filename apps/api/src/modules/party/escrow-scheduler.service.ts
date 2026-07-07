import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PAYMENT_ADAPTER } from '../../common/adapters/payment/payment-adapter.interface';
import type { PaymentAdapter } from '../../common/adapters/payment/payment-adapter.interface';

const PLAY_DURATION_MS = 3 * 60 * 60 * 1000; // 예약시간 + 3시간 = 플레이 종료 확정 시점
const DISPUTE_WINDOW_MS = 3 * 60 * 60 * 1000; // 종료 확정 후 3시간 클레임 대기 창

/**
 * [도메인 4] 사양 #3: Node-cron 스케줄러 정산 자동화 프로세스.
 * 플레이 종료 확정 시점(reservedAt + 3h) 이후 3시간 동안 클레임(DISPUTED)이
 * 없으면 홀딩된 예치금을 해제(Release)한다.
 */
@Injectable()
export class EscrowSchedulerService {
  private readonly logger = new Logger(EscrowSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_ADAPTER) private readonly payment: PaymentAdapter,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const releaseCutoff = new Date(
      Date.now() - PLAY_DURATION_MS - DISPUTE_WINDOW_MS,
    );

    const parties = await this.prisma.party.findMany({
      where: { status: 'FILLED', reservedAt: { lte: releaseCutoff } },
      include: { participants: true },
    });

    for (const party of parties) {
      for (const participant of party.participants) {
        if (participant.escrowStatus !== 'HOLDING') continue;
        await this.payment.release(participant.escrowTxRef!);
        await this.prisma.partyParticipant.update({
          where: { id: participant.id },
          data: { escrowStatus: 'RELEASED' },
        });
      }
      await this.prisma.party.update({
        where: { id: party.id },
        data: { status: 'SETTLED' },
      });
      this.logger.log(
        `Party ${party.id} auto-settled: escrow released to host`,
      );
    }
  }
}
