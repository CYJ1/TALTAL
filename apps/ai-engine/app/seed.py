"""
Neo4j 그래프 토폴로지 시드 스크립트
==================================
PRD 사양의 노드/엣지 스키마를 실제 Neo4j 인스턴스에 구축한다.

노드: (:User), (:Theme), (:Genre), (:Tag)
관계: (:User)-[:CLEARED {clear_time, remaining_time, actual_players_count,
                          total_hints, rating_score}]->(:Theme)
      (:Theme)-[:BELONGS_TO]->(:Genre)
      (:Theme)-[:TAGGED]->(:Tag)

실제 서비스에서는 리뷰(Domain 3)가 저장될 때마다 NestJS가 이 그래프를 증분
업데이트해야 하지만, 이 스크립트는 데모/개발용 초기 시드를 담당한다.
"""

from __future__ import annotations

import asyncio
import logging

from app.neo4j_client import get_driver

logging.basicConfig(level=logging.INFO, format="%(asctime)s [ai-engine] %(message)s")
log = logging.getLogger(__name__)

THEMES = [
    {
        "theme_id": "confession",
        "theme_name": "고백",
        "store_name": "키이스케이프 강남점",
        "genre": "감성",
        "tags": ["장치중심", "감성레전드", "나레이션필수"],
        "capacity_min": 2,
        "capacity_max": 5,
    },
    {
        "theme_id": "ring",
        "theme_name": "링",
        "store_name": "제로월드 강남점",
        "genre": "공포",
        "tags": ["공포도최상", "탱커필수", "연출대박"],
        "capacity_min": 2,
        "capacity_max": 6,
    },
    {
        "theme_id": "yesterday-today",
        "theme_name": "어제, 오늘, 그리고",
        "store_name": "머더파커 강남점",
        "genre": "미스터리",
        "tags": ["문제방", "뚝배기유형", "활동성낮음"],
        "capacity_min": 2,
        "capacity_max": 4,
    },
    {
        "theme_id": "key-double-life",
        "theme_name": "열쇠공의 이중생활",
        "store_name": "포인트나인 강남점",
        "genre": "잠입",
        "tags": ["잠입", "장치중심", "스토리연계성"],
        "capacity_min": 2,
        "capacity_max": 5,
    },
]

# (user_id, display_name, stats) — stats: LOGIC, OBSERVE, SPEED, STORY, SOLVING, TANK
USERS = [
    ("escaper_pro", "방탈출고인물", {"LOGIC": 95, "OBSERVE": 90, "SPEED": 88, "STORY": 72, "SOLVING": 76, "TANK": 98}),
    ("user_b", "유저B", {"LOGIC": 70, "OBSERVE": 80, "SPEED": 60, "STORY": 65, "SOLVING": 55, "TANK": 40}),
    ("user_c", "유저C", {"LOGIC": 60, "OBSERVE": 65, "SPEED": 70, "STORY": 88, "SOLVING": 82, "TANK": 45}),
]

# (user_id, theme_id, clear_time_sec, remaining_time_sec, actual_players_count, total_hints, rating_score)
CLEARED_LOGS = [
    ("escaper_pro", "confession", 2400, 900, 3, 1, 5.0),
    ("escaper_pro", "ring", 2700, 315, 4, 3, 4.7),
    ("user_b", "confession", 2500, 700, 3, 2, 4.5),
    ("user_b", "key-double-life", 2600, 400, 3, 2, 4.2),
    ("user_c", "yesterday-today", 2200, 1100, 2, 0, 4.9),
    ("user_c", "key-double-life", 2650, 350, 3, 4, 4.0),
]


async def seed() -> None:
    driver = await get_driver()
    async with driver.session() as session:
        await session.run(
            "CREATE CONSTRAINT user_id IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE"
        )
        await session.run(
            "CREATE CONSTRAINT theme_id IF NOT EXISTS FOR (t:Theme) REQUIRE t.id IS UNIQUE"
        )
        await session.run(
            "CREATE CONSTRAINT genre_name IF NOT EXISTS FOR (g:Genre) REQUIRE g.name IS UNIQUE"
        )
        await session.run(
            "CREATE CONSTRAINT tag_name IF NOT EXISTS FOR (tg:Tag) REQUIRE tg.name IS UNIQUE"
        )

        for theme in THEMES:
            await session.run(
                """
                MERGE (t:Theme {id: $theme_id})
                SET t.name = $theme_name,
                    t.store_name = $store_name,
                    t.capacity_min = $capacity_min,
                    t.capacity_max = $capacity_max
                MERGE (g:Genre {name: $genre})
                MERGE (t)-[:BELONGS_TO]->(g)
                WITH t
                UNWIND $tags AS tagName
                MERGE (tg:Tag {name: tagName})
                MERGE (t)-[:TAGGED]->(tg)
                """,
                **theme,
            )

        for user_id, name, stats in USERS:
            await session.run(
                """
                MERGE (u:User {id: $user_id})
                SET u.name = $name,
                    u.logic = $LOGIC, u.observe = $OBSERVE, u.speed = $SPEED,
                    u.story = $STORY, u.solving = $SOLVING, u.tank = $TANK
                """,
                user_id=user_id,
                name=name,
                **stats,
            )

        for user_id, theme_id, clear_time, remaining_time, players, hints, rating in CLEARED_LOGS:
            await session.run(
                """
                MATCH (u:User {id: $user_id}), (t:Theme {id: $theme_id})
                MERGE (u)-[c:CLEARED]->(t)
                SET c.clear_time = $clear_time,
                    c.remaining_time = $remaining_time,
                    c.actual_players_count = $players,
                    c.total_hints = $hints,
                    c.rating_score = $rating
                """,
                user_id=user_id,
                theme_id=theme_id,
                clear_time=clear_time,
                remaining_time=remaining_time,
                players=players,
                hints=hints,
                rating=rating,
            )

    log.info("Neo4j graph seeded: %d themes, %d users, %d cleared edges",
              len(THEMES), len(USERS), len(CLEARED_LOGS))


if __name__ == "__main__":
    asyncio.run(seed())
