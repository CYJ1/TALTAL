"""
하이브리드형 추천인원 정제 연산 (PRD 도메인 1, 사양 #4)
=====================================================
공홈의 '공식 매장 정원' 스트링과, 플랫폼 사용자가 리뷰 시 투표한 '실체감 최적 인원'
최다 통계 스냅샷을 상호 매핑/결합하여 최종 추천 인원 칩을 만든다.

이 모듈에서는 review_headcount_votes(테마별 {인원: 표수})를 두 번째 입력으로 받는다.
실서비스에서는 이 값을 Postgres의 themes_reviews.selected_tags 기반 집계 쿼리로
가져오지만, 여기서는 스크래퍼가 독립 프로세스로 동작할 수 있도록 시드 통계를 내장했다.
"""

from __future__ import annotations

from app.models import RecommendedHeadcount

# 테마별 커뮤니티 투표 스냅샷 (실서비스에서는 Postgres 집계로 대체)
SEED_VOTE_STATS: dict[str, dict[int, int]] = {
    "confession": {2: 4, 3: 21, 4: 6},
    "ring": {3: 5, 4: 18, 5: 9},
    "yesterday-today": {2: 14, 3: 3},
    "key-double-life": {2: 3, 3: 17, 4: 4},
}

_REASON_TEMPLATES = {
    "small": "공간 협소로 {n}인 최적",
    "balanced": "탱{tank}+딜{dps} 최적",
    "story": "스토리 집중형 {n}인 최적",
}


def compute_recommended_headcount(
    theme_id: str, capacity_min: int, capacity_max: int
) -> RecommendedHeadcount:
    votes = SEED_VOTE_STATS.get(theme_id, {})
    if not votes:
        # 투표 데이터가 없으면 공식 정원의 중간값으로 폴백
        fallback = round((capacity_min + capacity_max) / 2)
        return RecommendedHeadcount(
            recommended=fallback,
            reason=f"매장 정원 {capacity_min}~{capacity_max}인 기준 중간값 추천",
            sample_size=0,
        )

    best_n, best_votes = max(votes.items(), key=lambda kv: kv[1])
    sample_size = sum(votes.values())

    if best_n <= 3:
        reason = _REASON_TEMPLATES["small"].format(n=best_n)
    elif best_n == 4:
        reason = _REASON_TEMPLATES["balanced"].format(tank=1, dps=best_n - 1)
    else:
        reason = _REASON_TEMPLATES["story"].format(n=best_n)

    return RecommendedHeadcount(
        recommended=best_n,
        reason=f"집계 체감 추천인원: {best_n}인 ({reason})",
        sample_size=sample_size,
    )
