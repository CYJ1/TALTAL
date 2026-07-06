from __future__ import annotations

import json
from collections.abc import Awaitable, Callable

import aio_pika

from app.config import RABBITMQ_URL, SCRAPE_QUEUE


class ScrapeJobBroker:
    """RabbitMQ 메시지 브로커 분산 처리 (Cache Miss 시 NestJS가 퍼블리싱하는 크롤링 이벤트)."""

    def __init__(self) -> None:
        self._connection: aio_pika.RobustConnection | None = None
        self._channel: aio_pika.abc.AbstractChannel | None = None

    async def connect(self) -> None:
        self._connection = await aio_pika.connect_robust(RABBITMQ_URL)
        self._channel = await self._connection.channel()
        await self._channel.set_qos(prefetch_count=10)
        await self._channel.declare_queue(SCRAPE_QUEUE, durable=True)

    async def consume(self, handler: Callable[[dict], Awaitable[None]]) -> None:
        assert self._channel is not None
        queue = await self._channel.declare_queue(SCRAPE_QUEUE, durable=True)

        async def _on_message(message: aio_pika.abc.AbstractIncomingMessage) -> None:
            async with message.process():
                payload = json.loads(message.body.decode())
                await handler(payload)

        await queue.consume(_on_message)

    async def close(self) -> None:
        if self._connection:
            await self._connection.close()
