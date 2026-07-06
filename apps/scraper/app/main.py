"""
Scraper Core 엔트리포인트
========================
1) RabbitMQ의 `scrape.requested` 큐를 구독해 NestJS(API)의 Cache-Miss 이벤트에
   응답하여 즉시 1회성 스크래핑을 수행한다.
2) 동시에 백그라운드 루프로 시드 매장 목록을 주기적으로 재수집하여, 캐시가 완전히
   비어있는 콜드 스타트 상황에서도 항상 최근 데이터가 존재하도록 유지한다.

수집 자체는 app.mock_source.fetch_snapshot (목업)을 사용한다. 실제 매장 대상이
확정되면 이 파일의 fetch_snapshot import만 실제 Playwright 구현으로 교체하면 된다.
"""

from __future__ import annotations

import asyncio
import logging

from app.broker import ScrapeJobBroker
from app.cache import TimeslotCache
from app.config import BACKGROUND_REFRESH_INTERVAL_SECONDS
from app.headcount_engine import compute_recommended_headcount
from app.mock_source import SEED_STORES, fetch_snapshot
from app.models import ThemeTimeslotSnapshot

logging.basicConfig(level=logging.INFO, format="%(asctime)s [scraper] %(message)s")
log = logging.getLogger(__name__)


async def scrape_and_cache(store: dict, cache: TimeslotCache) -> ThemeTimeslotSnapshot:
    raw = await fetch_snapshot(store)
    headcount = compute_recommended_headcount(
        raw.theme_id, raw.official_capacity_min, raw.official_capacity_max
    )
    snapshot = ThemeTimeslotSnapshot(
        store_id=raw.store_id,
        theme_id=raw.theme_id,
        official_capacity_min=raw.official_capacity_min,
        official_capacity_max=raw.official_capacity_max,
        slots=raw.slots,
        recommended_headcount=headcount,
        scraped_at=raw.scraped_at,
    )
    await cache.set_snapshot(snapshot)
    log.info("scraped %s/%s -> %s available slots", store["store_id"], store["theme_id"],
              sum(1 for s in raw.slots if s.status != "CLOSED"))
    return snapshot


async def background_refresh_loop(cache: TimeslotCache) -> None:
    while True:
        for store in SEED_STORES:
            try:
                await scrape_and_cache(store, cache)
            except Exception:  # noqa: BLE001
                log.exception("background refresh failed for %s", store["store_id"])
        await asyncio.sleep(BACKGROUND_REFRESH_INTERVAL_SECONDS)


async def handle_scrape_request(payload: dict, cache: TimeslotCache) -> None:
    store_id = payload.get("store_id")
    store = next((s for s in SEED_STORES if s["store_id"] == store_id), None)
    if store is None:
        log.warning("unknown store_id in scrape request: %s", store_id)
        return
    await scrape_and_cache(store, cache)


async def main() -> None:
    cache = TimeslotCache()
    broker = ScrapeJobBroker()

    try:
        await broker.connect()
    except Exception:  # noqa: BLE001
        log.warning("RabbitMQ unavailable, running in background-refresh-only mode")
        broker = None

    tasks = [asyncio.create_task(background_refresh_loop(cache))]

    if broker is not None:
        await broker.consume(lambda payload: handle_scrape_request(payload, cache))
        log.info("listening on scrape.requested queue")

    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
