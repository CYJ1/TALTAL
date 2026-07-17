import { Injectable } from '@nestjs/common';
import type { GenreTag, GenerationPreference, Prisma } from '../../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RabbitmqService } from '../../common/rabbitmq/rabbitmq.service';
import { haversineDistanceKm } from '../../common/geo/haversine';
import { SearchQueryDto } from './dto/search-query.dto';

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

    // 위치 정렬은 store 좌표만 있으면 계산 가능해서, 캐시/스크래핑 조회(enrich)
    // 전에 먼저 정렬해둔다 — 페이지네이션이 "가까운 순 상위 N개"를 자르게 하기 위함.
    type ThemeWithDistance = (typeof themes)[number] & { distanceKm: number | null };
    let ordered: ThemeWithDistance[] = themes.map((t) => ({ ...t, distanceKm: null }));
    if (query.lat != null && query.lng != null) {
      const origin = { lat: query.lat, lng: query.lng };
      ordered = ordered
        .map((t) => ({
          ...t,
          distanceKm:
            t.store.latitude != null && t.store.longitude != null
              ? haversineDistanceKm(origin.lat, origin.lng, t.store.latitude, t.store.longitude)
              : null,
        }))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    // availableOnly는 캐시된 실시간 슬롯 데이터가 있어야 판단 가능해서, 이 필터를
    // 쓸 때만 전체를 enrich한 뒤 필터링 -> 페이지네이션 순서로 간다 (느리지만
    // 정확함). 기본 화면(필터 없음)은 반대로 페이지네이션 -> enrich 순서라
    // Redis 조회/스크래핑 트리거가 실제로 보여줄 페이지 분량만큼만 일어난다.
    const enrich = async (theme: ThemeWithDistance) => {
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
        cacheStatus: cached ? ('HIT' as const) : ('REFRESHING' as const),
        distanceKm: theme.distanceKm,
        // 네이버 예약 페이지가 있으면 우선 사용하고, 없으면 매장 자체 홈페이지로 대체.
        // 둘 다 없으면 null — 프론트에서 "예약 링크 준비중"으로 처리한다.
        bookingUrl: theme.store.naverBookingUrl ?? theme.store.homepageUrl ?? null,
      };
    };

    if (query.availableOnly) {
      const enriched = await Promise.all(ordered.map(enrich));
      const filtered = enriched.filter((r) => r.slots.some((s) => s.status !== 'CLOSED'));
      return query.limit != null
        ? filtered.slice(query.offset ?? 0, (query.offset ?? 0) + query.limit)
        : filtered;
    }

    const page =
      query.limit != null ? ordered.slice(query.offset ?? 0, (query.offset ?? 0) + query.limit) : ordered;
    return Promise.all(page.map(enrich));
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
