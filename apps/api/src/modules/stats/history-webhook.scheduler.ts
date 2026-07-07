import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

const PLAY_DURATION_MS = 3 * 60 * 60 * 1000; // T = 예약시간 + 3시간

/**
 * [도메인 2] Webhook 기반 자동 일지 적재 대기 프로토콜
 * 예약 플레이 종료 예정 시간이 경과하면 참여자별 user_history_logs에
 * status='PENDING_REVIEW' 로우를 추가한다.
 */
@Injectable()
export class HistoryWebhookScheduler {
  private readonly logger = new Logger(HistoryWebhookScheduler.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    const parties = await this.prisma.party.findMany({
      where: {
        reservedAt: { lte: new Date(now.getTime() - PLAY_DURATION_MS) },
        status: { in: ['FILLED', 'SETTLED'] },
      },
      include: { participants: true },
    });

    for (const party of parties) {
      for (const participant of party.participants) {
        const exists = await this.prisma.userHistoryLog.findFirst({
          where: {
            userId: participant.userId,
            themeId: party.themeId,
            partyId: party.id,
          },
        });
        if (exists) continue;

        await this.prisma.userHistoryLog.create({
          data: {
            userId: participant.userId,
            themeId: party.themeId,
            playedAt: party.reservedAt,
            status: 'PENDING_REVIEW',
            partyId: party.id,
          },
        });
        this.logger.log(
          `Webhook: PENDING_REVIEW log created for user=${participant.userId} theme=${party.themeId}`,
        );
      }
    }
  }
}
