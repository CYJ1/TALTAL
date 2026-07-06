"""
목업 수집 소스 (Mock Collection Source)
=======================================
PRD 명세: "Python (Playwright Core) 비동기 크롤러 기동 엔진"이 타겟 방탈출 공홈의
예약 DOM 요소를 파싱한다.

실제 서비스 대상 매장 공홈 URL과 크롤링 허용 범위(robots.txt / 이용약관)가 확정되지
않았으므로, 이 모듈은 real Playwright 세션 대신 동일한 인터페이스(`fetch_snapshot`)를
제공하는 시드 기반 목업 소스로 대체되어 있다. 실연동 시 이 파일만 실제
`playwright.async_api`를 사용하는 구현으로 교체하면 나머지 파이프라인(RabbitMQ 발행,
Redis 캐시 적재, 추천인원 결합)은 변경 없이 그대로 동작한다.
"""

from __future__ import annotations

import hashlib
import random
from datetime import datetime, timezone

from app.models import RawStoreSnapshot, TimeSlot

SEED_STORES = [
    {
        "store_id": "keyescape-gangnam",
        "theme_id": "confession",
        "name": "키이스케이프 강남점",
        "theme_name": "고백",
        "capacity": (2, 5),
    },
    {
        "store_id": "zerooworld-gangnam",
        "theme_id": "ring",
        "name": "제로월드 강남점",
        "theme_name": "링",
        "capacity": (2, 6),
    },
    {
        "store_id": "murderparker-gangnam",
        "theme_id": "yesterday-today",
        "name": "머더파커 강남점",
        "theme_name": "어제, 오늘, 그리고",
        "capacity": (2, 4),
    },
    {
        "store_id": "point9-gangnam",
        "theme_id": "key-double-life",
        "name": "포인트나인 강남점",
        "theme_name": "열쇠공의 이중생활",
        "capacity": (2, 5),
    },
]

_SLOT_TIMES = [
    "14:00", "15:30", "16:30", "18:00", "18:15", "19:00",
    "19:40", "20:00", "21:15", "21:45", "22:30",
]


def _seeded_random(store_id: str) -> random.Random:
    # 매 호출마다 결과가 완전 랜덤이면 데모/디버깅이 어려우므로, 매장 ID + 현재 5분
    # 버킷을 시드로 사용해 "그럴듯하게 흔들리지만 재현 가능한" 데이터를 만든다.
    bucket = int(datetime.now(timezone.utc).timestamp() // 300)
    digest = hashlib.sha256(f"{store_id}:{bucket}".encode()).hexdigest()
    return random.Random(digest)


async def fetch_snapshot(store: dict) -> RawStoreSnapshot:
    """실제 구현에서는 이 함수가 playwright의 page.goto + DOM query를 수행한다."""
    rng = _seeded_random(store["store_id"])
    cap_min, cap_max = store["capacity"]

    slots: list[TimeSlot] = []
    for t in _SLOT_TIMES:
        roll = rng.random()
        status = "AVAILABLE" if roll > 0.55 else ("FEW_LEFT" if roll > 0.4 else "CLOSED")
        slots.append(TimeSlot(time=t, status=status))

    return RawStoreSnapshot(
        store_id=store["store_id"],
        theme_id=store["theme_id"],
        official_capacity_min=cap_min,
        official_capacity_max=cap_max,
        slots=slots,
        scraped_at=datetime.now(timezone.utc).isoformat(),
    )
