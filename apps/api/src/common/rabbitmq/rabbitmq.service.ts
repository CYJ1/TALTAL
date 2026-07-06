import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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
    const url = this.config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672');
    this.connection = amqp.connect([url]);
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`RabbitMQ disconnected: ${err?.message}`),
    );
    this.channelWrapper = this.connection.createChannel({
      setup: (channel) => channel.assertQueue(SCRAPE_QUEUE, { durable: true }),
    });
  }

  /** Cache Miss 비동기 스크래핑 위임 (사양 #3): 크롤링 이벤트를 RabbitMQ에 퍼블리싱 */
  async publishScrapeRequest(storeId: string, themeId: string): Promise<void> {
    try {
      await this.channelWrapper.sendToQueue(
        SCRAPE_QUEUE,
        Buffer.from(JSON.stringify({ store_id: storeId, theme_id: themeId })),
        { persistent: true },
      );
    } catch (err) {
      this.logger.warn(`Failed to publish scrape request: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.channelWrapper?.close();
    await this.connection?.close();
  }
}
