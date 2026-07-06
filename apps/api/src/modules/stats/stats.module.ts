import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { HistoryWebhookScheduler } from './history-webhook.scheduler';

@Module({
  controllers: [StatsController],
  providers: [StatsService, HistoryWebhookScheduler],
  exports: [StatsService],
})
export class StatsModule {}
