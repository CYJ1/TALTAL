import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';

export const SCRAPE_QUEUE = 'scrape.requested';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>(
      'RABBITMQ_URL',
      'amqp://guest:guest@localhost:5672',
    );
    this.connection = amqp.connect([url]);
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`RabbitMQ disconnected: ${err?.message}`),
    );
    this.channelWrapper = this.connection.createChannel({
      setup: (channel) => channel.assertQueue(SCRAPE_QUEUE, { durable: true }),
    });
  }

  /**
   * Cache Miss 비동기 스크래핑 위임 (사양 #3): 크롤링 이벤트를 RabbitMQ에 퍼블리싱.
   * amqp-connection-manager는 ioredis의 maxRetriesPerRequest 같은 명령 단위 타임아웃이
   * 없어서, RabbitMQ가 아예 연결이 안 되면 sendToQueue가 채널이 준비될 때까지
   * 무한정 대기한다 — 캐시 미스가 많은 요청(예: 검색 목록 전체)에서 이게 그대로
   * 요청 처리 시간이 되어버리므로 직접 타임아웃을 걸어 캐시 미스처럼 조용히 넘어간다.
   */
  async publishScrapeRequest(storeId: string, themeId: string): Promise<void> {
    try {
      await Promise.race([
        this.channelWrapper.sendToQueue(
          SCRAPE_QUEUE,
          Buffer.from(JSON.stringify({ store_id: storeId, theme_id: themeId })),
          { persistent: true },
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('RabbitMQ publish timed out')), 2000),
        ),
      ]);
    } catch (err) {
      this.logger.warn(
        `Failed to publish scrape request: ${(err as Error).message}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }
}
