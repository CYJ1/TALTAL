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
    // maxRetriesPerRequest: null — 기본값(20)으로 두면 Redis가 계속 연결 안 될 때
    // 대기 중이던 명령이 결국 MaxRetriesPerRequestError로 거부되고, 이걸 아무도
    // catch하지 않으면(예: 앱 시작 시 fire-and-forget로 구독하는 코드) 처리되지
    // 않은 프로미스 거부로 서버 전체가 죽는다. null로 두면 재연결될 때까지 계속
    // 대기만 하고 절대 던지지 않는다 (Redis 없이도 나머지 기능은 정상 동작해야 함).
    this.client = new Redis(url, {
      lazyConnect: false,
      retryStrategy: () => 2000,
      maxRetriesPerRequest: null,
    });
    this.subscriber = new Redis(url, {
      lazyConnect: false,
      retryStrategy: () => 2000,
      maxRetriesPerRequest: null,
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
