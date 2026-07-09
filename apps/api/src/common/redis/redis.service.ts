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
    // Redis는 캐시 레이어일 뿐이라 "연결 안 됨"은 "캐시 미스"와 동일하게 취급되어야
    // 한다 — 아래 getJson/setJson/subscribe가 실제로 그렇게 처리한다. 그러려면
    // 명령이 적당히 빨리 실패해야 하는데, maxRetriesPerRequest 기본값(20)은
    // retryStrategy 간격(2초)과 겹쳐 ~40초씩 걸리고(응답이 뻣뻣하게 느려짐),
    // null로 두면 아예 끝없이 기다린다(요청이 몇 분씩 멈춘 것처럼 보임). 짧게
    // 잡아 몇 초 안에 실패하고 캐시 미스로 넘어가도록 한다. 백그라운드 재연결
    // 시도(retryStrategy) 자체는 계속되므로 Redis가 나중에 뜨면 자동으로 복구된다.
    const redisOptions = {
      lazyConnect: false,
      retryStrategy: () => 500,
      maxRetriesPerRequest: 2,
    };
    this.client = new Redis(url, redisOptions);
    this.subscriber = new Redis(url, redisOptions);
    this.client.on('error', (err) =>
      this.logger.warn(`Redis client error: ${err.message}`),
    );
    this.subscriber.on('error', (err) =>
      this.logger.warn(`Redis subscriber error: ${err.message}`),
    );
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(`getJson(${key}) failed, treating as cache miss: ${(err as Error).message}`);
      return null;
    }
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds = CACHE_TTL_SECONDS,
  ): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`setJson(${key}) failed, skipping cache write: ${(err as Error).message}`);
    }
  }

  async subscribe(
    channel: string,
    onMessage: (payload: string) => void,
  ): Promise<void> {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (ch, message) => {
        if (ch === channel) onMessage(message);
      });
    } catch (err) {
      this.logger.warn(`subscribe(${channel}) failed: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    this.client.disconnect();
    this.subscriber.disconnect();
  }
}
