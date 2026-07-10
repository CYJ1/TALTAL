import { Injectable, NotFoundException } from '@nestjs/common';
import type { GenreTag, GenerationPreference, Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { haversineDistanceKm } from '../../common/geo/haversine';
import { SearchQueryDto } from './dto/search-query.dto';
import { generateMockSlotsForDate } from './future-slot-mock';

const FUTURE_SLOT_CACHE_TTL_SECONDS = 60 * 60 * 24; // 하루치 — 다음날이 되면 "오늘" 캐시로 자연 교체

interface CachedSnapshot {
  store_id: string;
  theme_id: string;
  official_capacity_min: number;
  official_capacity_max: number;
  slots: { time: string; status: string }[];
  recommended_headcount: {
    recommended: number;
    reason: string;
    sample_size: number;
  };
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
    const where: Prisma.ThemeWhereInput = {
      ...(query.district || query.neighborhood
        ? {
            store: {
              ...(query.district ? { district: query.district } : {}),
              ...(query.neighborhood ? { neighborhood: query.neighborhood } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { store: { name: { contains: query.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
      ...(query.genre ? { genre: query.genre as GenreTag } : {}),
      ...(query.generation ? { generation: query.generation as GenerationPreference } : {}),
      ...(query.preferenceTag ? { tags: { has: query.preferenceTag } } : {}),
      ...(query.maxPriceWon != null ? { pricePerPersonWon: { lte: query.maxPriceWon } } : {}),
      ...(query.maxDifficulty != null ? { difficulty: { lte: query.maxDifficulty } } : {}),
      ...(query.headcount != null
        ? { capacityMin: { lte: query.headcount }, capacityMax: { gte: query.headcount } }
        : {}),
    };

    const themes = await this.prisma.theme.findMany({
      where,
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
          genre: theme.genre,
          generation: theme.generation,
          difficulty: theme.difficulty,
          pricePerPersonWon: theme.pricePerPersonWon,
          district: theme.store.district,
          neighborhood: theme.store.neighborhood,
          latitude: theme.store.latitude,
          longitude: theme.store.longitude,
          rating: theme.rating,
          tags: theme.tags,
          capacityMin: cached?.official_capacity_min ?? theme.capacityMin,
          capacityMax: cached?.official_capacity_max ?? theme.capacityMax,
          slots: cached?.slots ?? [],
          // 캐시(실시간 스크래핑 결과)가 아직 없으면 DB에 저장된 초기값(공식 정원/크롤링
          // 기준값)으로 대체한다 — 리뷰가 쌓이면 headcount_engine이 캐시 값을 갱신한다.
          recommendedHeadcount:
            cached?.recommended_headcount ??
            (theme.recommendedHeadcount
              ? {
                  recommended: theme.recommendedHeadcount,
                  reason: theme.recommendedReason ?? '',
                  sample_size: 0,
                }
              : null),
          cacheStatus: cached ? 'HIT' : 'REFRESHING',
        };
      }),
    );

    let filtered = results;
    if (query.availableOnly) {
      filtered = filtered.filter((r) => r.slots.some((s) => s.status !== 'CLOSED'));
    }

    if (query.lat != null && query.lng != null) {
      const origin = { lat: query.lat, lng: query.lng };
      return filtered
        .map((r) => ({
          ...r,
          distanceKm:
            r.latitude != null && r.longitude != null
              ? haversineDistanceKm(origin.lat, origin.lng, r.latitude, r.longitude)
              : null,
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return filtered;
  }

  /**
   * 예약 화면의 날짜별 시간대 조회. "오늘"은 기존 Redis 1차 조회 -> RabbitMQ
   * 크롤링 위임 파이프라인을 그대로 쓰고, 오늘 이후 날짜는 매장별 실제 크롤러
   * 어댑터가 아직 없어 테마+날짜 시드 기반 목업 데이터를 생성해 캐싱한다
   * (실제 어댑터가 붙으면 이 분기는 제거하고 전부 실제 스크래핑 결과로 대체).
   */
  async getSlotsForDates(themeId: string, dates: string[]) {
    const theme = await this.prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) throw new NotFoundException(`theme ${themeId} not found`);

    const today = new Date().toISOString().slice(0, 10);

    const results = await Promise.all(
      dates.map(async (date) => {
        if (date === today) {
          const cacheKey = `timeslots:${theme.storeId}:${theme.id}`;
          const cached = await this.redis.getJson<CachedSnapshot>(cacheKey);
          if (!cached) {
            await this.rabbitmq.publishScrapeRequest(theme.storeId, theme.id);
            return { date, slots: [], cacheStatus: 'REFRESHING' as const };
          }
          return { date, slots: cached.slots, cacheStatus: 'HIT' as const };
        }

        const dateCacheKey = `timeslots:${theme.storeId}:${theme.id}:${date}`;
        const cached = await this.redis.getJson<{ slots: { time: string; status: string }[] }>(
          dateCacheKey,
        );
        if (cached) {
          return { date, slots: cached.slots, cacheStatus: 'MOCK_ESTIMATE' as const };
        }

        const slots = generateMockSlotsForDate(theme.id, date);
        await this.redis.setJson(dateCacheKey, { slots }, FUTURE_SLOT_CACHE_TTL_SECONDS);
        return { date, slots, cacheStatus: 'MOCK_ESTIMATE' as const };
      }),
    );

    return results;
  }

  /** 구/동 선택기 UI를 위해 실제 등록된 매장 기준 구 -> 동 목록을 반환한다. */
  async getDistrictFacets(): Promise<{ district: string; neighborhoods: string[] }[]> {
    const stores = await this.prisma.store.findMany({
      select: { district: true, neighborhood: true },
      distinct: ['district', 'neighborhood'],
    });

    const byDistrict = new Map<string, Set<string>>();
    for (const store of stores) {
      if (!byDistrict.has(store.district)) byDistrict.set(store.district, new Set());
      if (store.neighborhood) byDistrict.get(store.district)!.add(store.neighborhood);
    }

    return Array.from(byDistrict.entries())
      .map(([district, neighborhoods]) => ({
        district,
        neighborhoods: Array.from(neighborhoods).sort(),
      }))
      .sort((a, b) => a.district.localeCompare(b.district));
  }
}
