from __future__ import annotations

import json

import redis.asyncio as redis

from app.config import CACHE_TTL_SECONDS, REDIS_URL
from app.models import ThemeTimeslotSnapshot

PUBSUB_CHANNEL = "timeslots:updated"


class TimeslotCache:
    def __init__(self) -> None:
        self._client = redis.from_url(REDIS_URL, decode_responses=True)

    @staticmethod
    def _key(store_id: str, theme_id: str) -> str:
        return f"timeslots:{store_id}:{theme_id}"

    async def set_snapshot(self, snapshot: ThemeTimeslotSnapshot) -> None:
        key = self._key(snapshot.store_id, snapshot.theme_id)
        await self._client.set(key, snapshot.model_dump_json(), ex=CACHE_TTL_SECONDS)
        # NestJS가 구독 중인 SSE 브리지에 갱신을 알림 (사양: SSE/비동기 응답 동기화)
        await self._client.publish(PUBSUB_CHANNEL, snapshot.model_dump_json())

    async def get_snapshot(self, store_id: str, theme_id: str) -> str | None:
        return await self._client.get(self._key(store_id, theme_id))

    async def close(self) -> None:
        await self._client.aclose()
