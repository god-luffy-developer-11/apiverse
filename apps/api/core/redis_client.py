import asyncio
import json
from typing import AsyncGenerator
from core.config import settings

class RedisPubSubManager:
    def __init__(self):
        self.subscribers: dict[str, set[asyncio.Queue]] = {}

    async def publish(self, channel: str, message: dict):
        payload = json.dumps(message)
        if channel in self.subscribers:
            for q in list(self.subscribers[channel]):
                try:
                    await q.put(payload)
                except Exception:
                    pass

    async def subscribe(self, channel: str) -> AsyncGenerator[str, None]:
        q = asyncio.Queue()
        if channel not in self.subscribers:
            self.subscribers[channel] = set()
        self.subscribers[channel].add(q)
        try:
            while True:
                msg = await q.get()
                yield msg
        finally:
            self.subscribers[channel].discard(q)
            if not self.subscribers[channel]:
                del self.subscribers[channel]

pubsub_broker = RedisPubSubManager()
