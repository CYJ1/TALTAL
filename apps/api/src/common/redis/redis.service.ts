import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const CACHE_TTL_SECONDS = 300; // Redis Cache Layer 명세: TTL 5분 바이패스

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  readonly client: Redis;
  private readonly subscriber: Redis;

  constructor(config: ConfigService) {
    const url = config.get<string>('REDIS_URL', 'redis://localhost:6379/0');
    this.client = new Redis(url, {
      lazyConnect: false,
      retryStrategy: () => 2000,
    });
    this.subscriber = new Redis(url, {
      lazyConnect: false,
      retryStrategy: () => 2000,
    });
    this.client.on('error', (err) =>
      this.logger.warn(`Redis client error: ${err.message}`),
    );
    this.subscriber.on('error', (err) =>
      this.logger.warn(`Redis subscriber error: ${err.message}`),
    );
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds = CACHE_TTL_SECONDS,
  ): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async subscribe(
    channel: string,
    onMessage: (payload: string) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) onMessage(message);
    });
  }

  async onModuleDestroy() {
    this.client.disconnect();
    this.subscriber.disconnect();
  }
}
