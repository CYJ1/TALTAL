from __future__ import annotations

from pydantic import BaseModel


class RecommendedTheme(BaseModel):
    theme_id: str
    theme_name: str
    store_name: str
    tags: list[str]
    match_score: float  # 0~100 매칭률
    recommended_headcount: int
    capacity_min: int
    capacity_max: int
    reason: str


class RecommendationResponse(BaseModel):
    user_id: str
    peer_sample_size: int
    items: list[RecommendedTheme]


class HealthResponse(BaseModel):
    status: str
    neo4j_connected: bool
