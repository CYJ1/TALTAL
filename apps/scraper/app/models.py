from __future__ import annotations

from pydantic import BaseModel


class TimeSlot(BaseModel):
    time: str
    status: str  # "AVAILABLE" | "CLOSED" | "FEW_LEFT"


class RawStoreSnapshot(BaseModel):
    """Playwright Core가 매장 공홈 DOM에서 파싱했다고 가정하는 원본(raw) 스냅샷."""

    store_id: str
    theme_id: str
    official_capacity_min: int
    official_capacity_max: int
    slots: list[TimeSlot]
    scraped_at: str


class RecommendedHeadcount(BaseModel):
    """하이브리드형 추천인원 정제 연산 결과."""

    recommended: int
    reason: str
    sample_size: int


class ThemeTimeslotSnapshot(BaseModel):
    store_id: str
    theme_id: str
    official_capacity_min: int
    official_capacity_max: int
    slots: list[TimeSlot]
    recommended_headcount: RecommendedHeadcount
    scraped_at: str
    source: str = "playwright-core"
