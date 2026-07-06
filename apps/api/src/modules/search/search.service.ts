import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { SearchQueryDto } from './dto/search-query.dto';

interface CachedSnapshot {
  store_id: string;
  theme_id: string;
  official_capacity_min: number;
  official_capacity_max: number;
  slots: { time: string; status: string }[];
  recommended_headcount: { recommended: number; reason: string; sample_size: number };
  scraped_at: string;
  source: string;
}

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly rabbitmq: RabbitmqService,
  ) {}

  /**
   * [도메인 1] 시스템 엔진 사양 #2~#3: Redis 1차 조회 -> Cache Miss 시 RabbitMQ로
   * 크롤링 이벤트 퍼블리싱 위임. 캐시 적중 시 20ms 내외 응답을 목표로 한다.
   */
  async search(query: SearchQueryDto) {
    const themes = await this.prisma.theme.findMany({
      where: {
        ...(query.region ? { store: { region: query.region } } : {}),
        ...(query.preferenceTag ? { tags: { has: query.preferenceTag } } : {}),
      },
      include: { store: true },
      orderBy: { rating: 'desc' },
    });

    const results = await Promise.all(
      themes.map(async (theme) => {
        const cacheKey = `timeslots:${theme.storeId}:${theme.id}`;
        const cached = await this.redis.getJson<CachedSnapshot>(cacheKey);

        if (!cached) {
          await this.rabbitmq.publishScrapeRequest(theme.storeId, theme.id);
        }

        return {
          themeId: theme.id,
          storeId: theme.storeId,
          storeName: theme.store.name,
          themeName: theme.name,
          rating: theme.rating,
          tags: theme.tags,
          capacityMin: cached?.official_capacity_min ?? theme.capacityMin,
          capacityMax: cached?.official_capacity_max ?? theme.capacityMax,
          slots: cached?.slots ?? [],
          recommendedHeadcount: cached?.recommended_headcount ?? null,
          cacheStatus: cached ? 'HIT' : 'REFRESHING',
        };
      }),
    );

    if (query.availableOnly) {
      return results.filter((r) => r.slots.some((s) => s.status !== 'CLOSED'));
    }
    return results;
  }
}
