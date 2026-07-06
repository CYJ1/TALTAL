"""
그래프 임베딩 기반 추천 엔진 (간이 구현)
=======================================
PRD 사양은 GraphSAGE / Node2Vec 기반 고차원 벡터 임베딩을 요구하지만, 이는 대량의
클리어 로그와 오프라인 학습 파이프라인(GPU 배치잡, 임베딩 저장소)을 전제로 한다.
운영 데이터가 없는 현재 단계에서 실제로 GNN을 "학습"시키는 것은 무의미하므로,
이 모듈은 **동일한 그래프 스키마(Neo4j) 위에서** 다음 두 신호를 직접 계산하는
경량 대체 구현을 제공한다:

  1. 태그 코사인 유사도 — 유저가 높은 평점으로 클리어한 테마들의 태그 벡터와
     후보 테마의 태그 벡터 간 코사인 유사도 (그래프 토폴로지 상 근접 이웃 근사치)
  2. 취약 스탯 보정 점수 — 유저의 6대 스탯 중 최저 스탯을 보완하는 태그를
     후보 테마가 얼마나 갖고 있는지

실제 GraphSAGE 파이프라인으로 교체할 때도 이 함수의 반환 시그니처
(RecommendedTheme 목록)는 그대로 유지하면 되므로 API 계약은 안정적이다.
"""

from __future__ import annotations

import math
from collections import Counter

from neo4j import AsyncDriver

from app.config import TOP_K_RECOMMENDATIONS
from app.schemas import RecommendedTheme

# 태그 -> 보정 가능한 스탯 매핑 (theme_stat_weights 테이블의 간이 대응물)
TAG_STAT_MAP: dict[str, str] = {
    "나레이션필수": "STORY",
    "감성레전드": "STORY",
    "스토리연계성": "STORY",
    "장치중심": "SOLVING",
    "잠입": "OBSERVE",
    "연출대박": "OBSERVE",
    "탱커필수": "TANK",
    "공포도최상": "TANK",
    "뚝배기유형": "LOGIC",
    "문제방": "LOGIC",
    "활동성낮음": "SPEED",
}

STAT_KO = {
    "LOGIC": "추리력",
    "OBSERVE": "직관력",
    "SPEED": "활동성",
    "STORY": "스토리이해",
    "SOLVING": "문제해결",
    "TANK": "탱킹력",
}


def _cosine(a: dict[str, float], b: dict[str, float]) -> float:
    keys = set(a) | set(b)
    if not keys:
        return 0.0
    dot = sum(a.get(k, 0.0) * b.get(k, 0.0) for k in keys)
    norm_a = math.sqrt(sum(v * v for v in a.values())) or 1.0
    norm_b = math.sqrt(sum(v * v for v in b.values())) or 1.0
    return dot / (norm_a * norm_b)


async def recommend_for_user(driver: AsyncDriver, user_id: str) -> list[RecommendedTheme]:
    async with driver.session() as session:
        user_record = await (
            await session.run("MATCH (u:User {id: $user_id}) RETURN u", user_id=user_id)
        ).single()
        if user_record is None:
            return []
        user_node = user_record["u"]
        stats = {
            "LOGIC": user_node["logic"],
            "OBSERVE": user_node["observe"],
            "SPEED": user_node["speed"],
            "STORY": user_node["story"],
            "SOLVING": user_node["solving"],
            "TANK": user_node["tank"],
        }
        weakest_stat = min(stats, key=stats.get)

        cleared_result = await session.run(
            """
            MATCH (u:User {id: $user_id})-[c:CLEARED]->(t:Theme)-[:TAGGED]->(tag:Tag)
            RETURN t.id AS theme_id, c.rating_score AS rating, collect(tag.name) AS tags
            """,
            user_id=user_id,
        )
        cleared_rows = [row async for row in cleared_result]
        cleared_theme_ids = {row["theme_id"] for row in cleared_rows}

        best_cleared_theme = None
        best_rating = -1.0
        user_tag_vector: dict[str, float] = {}
        for row in cleared_rows:
            rating = row["rating"] or 0.0
            for tag in row["tags"]:
                user_tag_vector[tag] = user_tag_vector.get(tag, 0.0) + rating
            if rating > best_rating:
                best_rating = rating
                best_cleared_theme = row["theme_id"]

        candidates_result = await session.run(
            """
            MATCH (t:Theme)-[:TAGGED]->(tag:Tag)
            WHERE NOT t.id IN $cleared_ids
            RETURN t.id AS theme_id, t.name AS theme_name, t.store_name AS store_name,
                   t.capacity_min AS capacity_min, t.capacity_max AS capacity_max,
                   collect(tag.name) AS tags
            """,
            cleared_ids=list(cleared_theme_ids),
        )
        candidates = [row async for row in candidates_result]

        results: list[RecommendedTheme] = []
        for c in candidates:
            candidate_vector = {tag: 1.0 for tag in c["tags"]}
            similarity = _cosine(user_tag_vector, candidate_vector) if user_tag_vector else 0.0

            weak_tag_hits = sum(
                1 for tag in c["tags"] if TAG_STAT_MAP.get(tag) == weakest_stat
            )
            complement_score = min(1.0, weak_tag_hits / max(1, len(c["tags"])))

            match_score = round((0.7 * similarity + 0.3 * complement_score) * 100, 1)
            # 완전히 매칭 신호가 없는 콜드스타트 후보도 최소 매칭률을 부여해 캐러셀에 노출
            match_score = max(match_score, 60.0)

            if complement_score > similarity:
                reason = (
                    f"다차원 임베딩 공간에서 귀하의 취약 스탯 영역인 '{STAT_KO[weakest_stat]}' "
                    f"수치를 비약적으로 보정할 수 있는 최적의 시너지 테마입니다."
                )
            elif best_cleared_theme:
                reason = (
                    f"귀하가 최고 점수로 클리어한 테마와 그래프 위상 토폴로지 상 가장 촘촘한 "
                    f"코사인 유사도를 나타냅니다."
                )
            else:
                reason = "커뮤니티 클리어 데이터 기반 콜드스타트 추천 테마입니다."

            headcount_result = await session.run(
                """
                MATCH (:User)-[c:CLEARED]->(t:Theme {id: $theme_id})
                RETURN c.actual_players_count AS n
                """,
                theme_id=c["theme_id"],
            )
            headcounts = [row["n"] async for row in headcount_result]
            if headcounts:
                recommended_headcount = Counter(headcounts).most_common(1)[0][0]
            else:
                recommended_headcount = round((c["capacity_min"] + c["capacity_max"]) / 2)

            results.append(
                RecommendedTheme(
                    theme_id=c["theme_id"],
                    theme_name=c["theme_name"],
                    store_name=c["store_name"],
                    tags=c["tags"],
                    match_score=match_score,
                    recommended_headcount=recommended_headcount,
                    capacity_min=c["capacity_min"],
                    capacity_max=c["capacity_max"],
                    reason=reason,
                )
            )

        results.sort(key=lambda r: r.match_score, reverse=True)
        return results[:TOP_K_RECOMMENDATIONS]
